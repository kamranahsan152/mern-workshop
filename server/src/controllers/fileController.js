// -----------------------------------------------------------------------------
// fileController.js
// The controller runs AFTER the storage engine has already saved the file.
// Its only job: turn the storage engine's file object into clean JSON.
//
// The three drivers each report the saved location on a DIFFERENT property:
//
//   local disk   file.filename   -> we build the url ourselves
//   Cloudinary   file.path       -> already a full CDN url
//   S3           file.location   -> already a full bucket url
//
// We normalise all three into the same { filename, originalName, mimeType,
// size, url } shape, so the entire React app is driver-agnostic.
// -----------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const { UPLOAD_DIR } = require("../utils/paths");
const { DRIVER } = require("../middleware/upload");

// Build the public URL for a locally stored file.
function toLocalUrl(req, filename) {
  // req.protocol -> "http", req.get("host") -> "localhost:5000"
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

// Shape one storage-engine file object into our API response format.
function toFileDTO(req, file) {
  let url, filename;

  if (DRIVER === "cloudinary") {
    url = file.path;          // https://res.cloudinary.com/.../s17-collage/abc.jpg
    filename = file.filename; // the public_id — you need this to delete it later
  } else if (DRIVER === "s3") {
    url = file.location;      // https://bucket.s3.region.amazonaws.com/photos/abc.jpg
    filename = file.key;      // "photos/abc.jpg"
  } else {
    filename = file.filename; // the safe name we generated
    url = toLocalUrl(req, filename);
  }

  return {
    filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url,
  };
}

// POST /api/files/upload
function uploadFiles(req, res) {
  // If multer ran but no file field was present, req.files is an empty array.
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files received. Send them in a "photos" field.',
    });
  }

  const files = req.files.map((file) => toFileDTO(req, file));

  return res.status(201).json({
    success: true,
    count: files.length,
    files,
  });
}

// GET /api/files  — everything currently stored.
// Reading the local folder only works for the local driver. In production you
// would keep this list in MongoDB instead (see the stretch assignment).
function listFiles(req, res) {
  if (DRIVER !== "local") {
    return res.json({
      success: true,
      count: 0,
      files: [],
      note: "Listing is only implemented for the local driver. Store photo metadata in MongoDB for cloud drivers.",
    });
  }

  const names = fs
    .readdirSync(UPLOAD_DIR)
    .filter((name) => !name.startsWith(".")) // skip .gitkeep etc.
    .sort()
    .reverse(); // newest first (our names start with a timestamp)

  const files = names.map((name) => {
    const stats = fs.statSync(path.join(UPLOAD_DIR, name));
    return {
      filename: name,
      originalName: name,
      mimeType: "image/*",
      size: stats.size,
      url: toLocalUrl(req, name),
    };
  });

  return res.json({ success: true, count: files.length, files });
}

// DELETE /api/files/:filename
async function deleteFile(req, res, next) {
  try {
    if (DRIVER === "cloudinary") {
      const { cloudinary } = require("../middleware/storage/cloudinaryStorage");
      const result = await cloudinary.uploader.destroy(req.params.filename);
      if (result.result !== "ok") {
        return res.status(404).json({ success: false, message: "File not found" });
      }
      return res.json({ success: true, filename: req.params.filename });
    }

    if (DRIVER === "s3") {
      const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
      const { s3 } = require("../middleware/storage/s3Storage");
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: req.params.filename,
        })
      );
      return res.json({ success: true, filename: req.params.filename });
    }

    // ---- local driver ----
    // SECURITY: path.basename() strips any "../" the client tried to sneak in,
    // so `filename` can never point outside the uploads folder.
    const safeName = path.basename(req.params.filename);
    const fullPath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    fs.unlinkSync(fullPath);
    return res.json({ success: true, filename: safeName });
  } catch (err) {
    return next(err);
  }
}

module.exports = { uploadFiles, listFiles, deleteFile };
