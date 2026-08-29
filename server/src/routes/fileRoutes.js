// -----------------------------------------------------------------------------
// fileRoutes.js
// Notice the ORDER of arguments on the POST route:
//   router.post(path, MIDDLEWARE, CONTROLLER)
// Multer must run first, because the controller needs req.files to already exist.
// -----------------------------------------------------------------------------
const express = require("express");
const { uploadPhotos } = require("../middleware/upload");
const {
  uploadFiles,
  listFiles,
  deleteFile,
} = require("../controllers/fileController");

const router = express.Router();

router.post("/upload", uploadPhotos, uploadFiles);
router.get("/", listFiles);
router.delete("/:filename(*)", deleteFile);

module.exports = router;
