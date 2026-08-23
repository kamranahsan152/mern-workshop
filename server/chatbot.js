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

async function askBot(history) {
  const baseUrl = (process.env.CHATBOT_API_BASE || "").replace(/\/+$/, "");
  if (!baseUrl || !process.env.CHATBOT_API_KEY || !process.env.CHATBOT_MODEL) {
    throw new Error(
      "Chatbot API is not configured. Set CHATBOT_API_BASE, CHATBOT_API_KEY, and CHATBOT_MODEL.",
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CHATBOT_API_KEY}`,
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: process.env.CHATBOT_MODEL,
      messages: [
        {
          role: "system",
          content:
            process.env.CHATBOT_SYSTEM_PROMPT ||
            "You are a helpful teaching assistant. Explain concepts clearly, use examples, and be concise.",
        },
        ...history,
      ],
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Chatbot API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => part.text || "").join("")
    : content;

  return text?.trim() || "I do not have an answer for that yet.";
}

module.exports = { BOT_EMAIL, BOT_NAME, askBot, ensureBotUser };
