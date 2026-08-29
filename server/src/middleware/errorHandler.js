// -----------------------------------------------------------------------------
// errorHandler.js
// An Express error handler is just a middleware with FOUR arguments.
// That 4th-argument signature is how Express recognises it. Do not remove `next`
// even though we don't call it — remove it and this stops being an error handler.
// -----------------------------------------------------------------------------
const multer = require("multer");
const { MAX_FILE_SIZE_MB, MAX_FILES } = require("./upload");

function errorHandler(err, req, res, next) {
  // --- Errors thrown by Multer itself ---
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum is ${MAX_FILES} per upload.`,
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Files must be sent as "photos".',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // --- Our own custom error from fileFilter ---
  if (err && err.code === "INVALID_FILE_TYPE") {
    return res.status(415).json({ success: false, message: err.message });
  }

  // --- Anything else is a genuine server bug ---
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
}

module.exports = { errorHandler };
