// -----------------------------------------------------------------------------
// localStorage.js — writes files to server/uploads/ on this machine's disk.
// This is the DEFAULT driver. It needs no extra npm packages and no API keys.
// -----------------------------------------------------------------------------
const multer = require("multer");
const { UPLOAD_DIR } = require("../../utils/paths");
const { makeSafeFilename } = require("../../utils/filename");

// multer.diskStorage takes two callbacks: where, and what to call it.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, makeSafeFilename(file.originalname));
  },
});

module.exports = storage;
