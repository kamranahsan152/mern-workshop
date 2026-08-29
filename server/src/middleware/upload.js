// -----------------------------------------------------------------------------
// upload.js  —  THE UPLOAD MIDDLEWARE (the heart of this session)
//
// Express by itself CANNOT read a file upload.
// express.json() understands  Content-Type: application/json
// A file upload arrives as     Content-Type: multipart/form-data
//
// Multer is middleware that sits in front of the route handler, parses that
// multipart body, hands each file to a STORAGE ENGINE, and gives you req.files.
//
// THE BIG IDEA: "storage" is an interface. Local disk, Cloudinary and S3 are
// three implementations of it. Everything else in this file — the filter, the
// limits, the field name, the route — is identical for all three.
// -----------------------------------------------------------------------------
const multer = require("multer");

// ----- Limits (tune these for your class) -----
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);
const MAX_FILES = Number(process.env.MAX_FILES || 10);

// ----- 1. WHERE do files go?  Pick the driver from .env -----
// STORAGE_DRIVER = local (default) | cloudinary | s3
const DRIVER = (process.env.STORAGE_DRIVER || "local").toLowerCase();

// We require() lazily INSIDE each branch. That matters: it means the project
// runs on the default local driver without installing the cloud packages.
let storage;
if (DRIVER === "cloudinary") {
  storage = require("./storage/cloudinaryStorage");
} else if (DRIVER === "s3") {
  storage = require("./storage/s3Storage");
} else {
  storage = require("./storage/localStorage");
}

// ----- 2. WHICH files are allowed? -----
// fileFilter runs BEFORE the file is stored. Call cb(null, false) to silently
// skip, or pass an Error to reject the whole request.
function fileFilter(req, file, cb) {
  // file.mimetype is reported by the browser, e.g. "image/png".
  if (!file.mimetype.startsWith("image/")) {
    // Give the error a code so our error handler can produce a clean message.
    const err = new Error("Only image files are allowed");
    err.code = "INVALID_FILE_TYPE";
    return cb(err, false);
  }
  cb(null, true); // accept
}

// ----- 3. Put it together -----
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // bytes
    files: MAX_FILES,
  },
});

// upload.array("photos", MAX_FILES) means:
//   "read up to MAX_FILES files from the form field named 'photos'"
// The field name MUST match what the frontend puts in its FormData.
const uploadPhotos = upload.array("photos", MAX_FILES);

module.exports = { uploadPhotos, MAX_FILE_SIZE_MB, MAX_FILES, DRIVER };
