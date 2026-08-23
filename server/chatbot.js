const User = require("./models/User");

const BOT_EMAIL = "chatbot@local.app";
const BOT_NAME = "Chatbot";

async function ensureBotUser() {
  const existing = await User.findOneAndUpdate(
    { role: "bot" },
    { $set: { name: BOT_NAME } },
    { new: true },
  );
  if (existing) return existing;

  return User.create({
    name: BOT_NAME,
    email: BOT_EMAIL,
    role: "bot",
  });
}

module.exports = { ensureBotUser };
