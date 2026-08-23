const User = require("../models/User");
const { ensureBotUser } = require("../chatbot");

async function listChatUsers(req, res) {
  await ensureBotUser();
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select("name email role")
    .sort({ name: 1 });

  res.json({ success: true, users });
}

module.exports = { listChatUsers };
