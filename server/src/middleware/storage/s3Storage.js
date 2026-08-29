// -----------------------------------------------------------------------------
// s3Storage.js — PRODUCTION DRIVER (Amazon S3)
//
// Enable with:  STORAGE_DRIVER=s3  in server/.env
//
// First install:
//     npm install @aws-sdk/client-s3 multer-s3
//     npm install @aws-sdk/s3-request-presigner   (only if you want private files)
//
// Then add to server/.env:
//     AWS_REGION=ap-south-1
//     AWS_ACCESS_KEY_ID=your_key
//     AWS_SECRET_ACCESS_KEY=your_secret
//     S3_BUCKET=s17-photo-collage
//
// VOCABULARY
//   Bucket    the container. Its name is globally unique across all of AWS.
//   Key       the file's full path inside the bucket, e.g. "photos/abc.jpg".
//   Region    where the bucket physically lives. Pick one near your users.
//   IAM user  the identity your server authenticates as. Give it the minimum
//             permissions it needs: PutObject, GetObject, DeleteObject.
// -----------------------------------------------------------------------------
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const { makeSafeFilename } = require("../../utils/filename");

["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET"].forEach(
  (key) => {
    if (!process.env[key]) {
      throw new Error(`Missing ${key} in .env — required for STORAGE_DRIVER=s3`);
    }
  }
);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET,
  // Without this every object is stored as application/octet-stream and the
  // browser downloads it instead of displaying it.
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    // Exactly the same safe-filename helper we used for local disk.
    // The security lesson transfers directly to the cloud.
    cb(null, "photos/" + makeSafeFilename(file.originalname));
  },
});

module.exports = storage;
module.exports.s3 = s3;
