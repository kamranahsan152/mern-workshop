const User = require("../models/User");
const getUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
  res.json({ success: true, users });
};

module.exports = getUsers;
