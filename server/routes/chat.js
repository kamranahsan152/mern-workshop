const express = require("express");
const { protect } = require("../middleware/auth");
const { listChatUsers } = require("../controllers/chatUsers");

const router = express.Router();

// Every route after this line requires a valid login cookie.
router.use(protect);
router.get("/users", listChatUsers);

module.exports = router;
