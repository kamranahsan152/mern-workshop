const express = require("express");
const { login, register, logout, details } = require("../controllers/user");
const { protect } = require("../middleware/auth");
const auth = express();

auth.post("/login", login);
auth.post("/register", register);
auth.post("/logout", logout);
auth.get("/details", protect, details);

module.exports = { auth };
