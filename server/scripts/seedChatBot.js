require("dotenv").config();
const mongoose = require("mongoose");
const { ensureBotUser } = require("../chatbot");

async function run() {
  await mongoose.connect(process.env.DB_URL);
  const bot = await ensureBotUser();
  console.log(`Chatbot is ready: ${bot.name}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
