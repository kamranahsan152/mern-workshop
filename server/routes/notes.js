const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/notes");

const router = express.Router();

router.use(protect);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
