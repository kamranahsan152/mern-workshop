// -----------------------------------------------------------------------------
// cloudinaryStorage.js — PRODUCTION DRIVER (Cloudinary)
//
// Enable with:  STORAGE_DRIVER=cloudinary  in server/.env
//
// First install the two extra packages:
//     npm install cloudinary multer-storage-cloudinary
//
// Then add to server/.env:
//     CLOUDINARY_CLOUD_NAME=your_cloud_name
//     CLOUDINARY_API_KEY=your_key
//     CLOUDINARY_API_SECRET=your_secret
//
// NOTE: this file is only require()'d when STORAGE_DRIVER=cloudinary, so the
// project still runs with zero extra dependencies on the default local driver.
// -----------------------------------------------------------------------------
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Fail loudly and early if the keys are missing, rather than at upload time.
["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].forEach(
  (key) => {
    if (!process.env[key]) {
      throw new Error(`Missing ${key} in .env — required for STORAGE_DRIVER=cloudinary`);
    }
  }
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || "s17-collage",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
    // Cloudinary can resize DURING upload. "limit" only shrinks images that are
    // bigger than the box — it never upscales and never crops.
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  },
});

// Export the cloudinary client too, so the controller can delete assets.
module.exports = storage;
module.exports.cloudinary = cloudinary;
