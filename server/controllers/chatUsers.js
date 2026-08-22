const User = require("../models/User");

async function listChatUsers(req, res) {
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select("name email")
    .sort({ name: 1 });

  res.json({ success: true, users });
}

module.exports = { listChatUsers };
