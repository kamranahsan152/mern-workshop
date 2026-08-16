const express = require("express");
const requireRole = require("../middleware/requireRole");
const getUsers = require("../controllers/admin");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/users", protect, requireRole("admin"), getUsers);

module.exports = router;
