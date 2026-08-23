# MERN Chatbot: classroom and live-demo guide

This project now has one chat experience for humans and the chatbot:

```text
Browser (React) -> Socket.IO -> MongoDB messages
                         |
                         +-> OpenAI-compatible AI gateway -> bot reply
```

The chatbot is a real MongoDB `User` with `role: "bot"`. Therefore every
logged-in student sees the same chatbot in the chat sidebar, every user/bot
message is saved in `messages`, reopening the chat loads history, and the
browser never receives the provider API key.

## 1. Important security rule

Never put the AI key in `client/`, React source, a public README, a screenshot,
or a Git commit. Keep it only in `server/.env`. If a real key was committed or
shared, revoke it and create a new one.

`server/.env` is ignored by Git. Copy the example first:

```bash
cd server
cp .env.example .env
```

Then replace the placeholder key with your own key.

## 2. Provider settings

The server uses the OpenAI-compatible `POST {CHATBOT_API_BASE}/chat/completions`
contract. Change only the three provider variables when switching gateways.

### This repo's current setup: OpenCode Zen

`server/.env` in this project is already configured and verified working
against the OpenCode Zen gateway:

```dotenv
CHATBOT_API_BASE=https://opencode.ai/zen/v1
CHATBOT_API_KEY=sk-your-real-opencode-key
CHATBOT_MODEL=mimo-v2.5-free
```

Confirmed live with `askBot()` during setup — a real request/response round
trip through this exact config.

### Also demoed: routesme.online

This project was tested against routesme.online too. Two gotchas worth
showing students, since both produce misleading errors instead of clear ones:

```dotenv
CHATBOT_API_BASE=https://routesme.online/v1
CHATBOT_API_KEY=rm-your-real-key
CHATBOT_MODEL=GLM5.2-free
```

1. The base path is `/v1`, not `/api/v1` — hitting the wrong path returns a
   generic `404 API endpoint not found` with no hint about what's wrong.
2. Model ids are case-sensitive and provider-specific (`GLM5.2-free`, not
   `glm.2-free`). A wrong id returns `503 all_keys_failed` instead of a
   clearer "model not found" error.

Always confirm both by listing the provider's own catalog before assuming a
model name:

```bash
curl https://routesme.online/v1/models \
  -H "Authorization: Bearer $CHATBOT_API_KEY"
```

### Also usable: OpenRouter

Use:

```dotenv
CHATBOT_API_BASE=https://openrouter.ai/api/v1
CHATBOT_API_KEY=sk-or-v1-replace-me
CHATBOT_MODEL=openrouter/free
```

`openrouter/free` is a free router that selects an available free model. For a
fixed model, try `openai/gpt-oss-20b:free` when it is available in the catalog.
Free model availability and limits change, so check the model page before a
live class. OpenRouter documents the endpoint as
`https://openrouter.ai/api/v1/chat/completions` and lists models at
[openrouter.ai/models](https://openrouter.ai/models), with the free filter at
[openrouter.ai/models?pricing=free](https://openrouter.ai/models?pricing=free).

Check the key and model from a terminal:

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $CHATBOT_API_KEY"
```

OpenRouter free limits are account/provider dependent. A free account can be
rate-limited, so keep a second provider ready for a live class.

### OpenCode Zen (more detail)

This is the provider currently wired up (see section above). If the key you
have is an OpenCode Zen key, do not send it to OpenRouter or any other
provider — each gateway only accepts its own keys. `mimo-v2.5-free` is one of
OpenCode Zen's current free OpenAI-compatible models. Confirm the current list
with:

```bash
curl https://opencode.ai/zen/v1/models \
  -H "Authorization: Bearer $CHATBOT_API_KEY"
```

Some OpenCode models use `/responses` or `/messages` instead of
`/chat/completions`; choose one listed as OpenAI-compatible chat completions.

### AgentRouter

AgentRouter is another option to demonstrate an OpenAI-compatible gateway:

```dotenv
CHATBOT_API_BASE=https://agentrouter.org/v1
CHATBOT_API_KEY=replace-with-your-agentrouter-key
CHATBOT_MODEL=copy-a-model-id-from-your-agentrouter-model-list
```

Verify the exact model id and compatibility in the AgentRouter dashboard before
class. Never assume a model name from another provider works here:

```bash
curl https://agentrouter.org/v1/models \
  -H "Authorization: Bearer $CHATBOT_API_KEY"
```

## 3. What changed in this repository

### 3.1 The bot user

`server/models/User.js` now allows the roles `user`, `admin`, and `bot`. A bot
does not need a password. The application identifies the chatbot by its
database role, never by a hardcoded MongoDB id:

```js
const BOT_EMAIL = "chatbot@local.app";
const BOT_NAME = "Chatbot";
```

MongoDB generates the bot's `_id` normally. The `role: "bot"` field is the
source of truth, so deleting/re-seeding the bot does not require a code change.

### 3.2 Idempotent seed script

Run this as many times as needed; it updates the same record instead of making
duplicates:

```bash
cd server
npm run seed:chatbot
```

`ensureBotUser()` looks for a user whose role is `bot` and creates one if
missing:

```js
async function ensureBotUser() {
  const existing = await User.findOne({ role: "bot" });
  if (existing) return existing;

  return User.create({
    name: BOT_NAME,
    email: BOT_EMAIL,
    role: "bot",
  });
}
```

The script is `server/scripts/seedChatbot.js`:

```js
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
```

The server also calls `ensureBotUser()` at startup and after a user registers
or logs in. The seed command is still useful for teaching database seeding and
for preparing a fresh database before a demo.

### 3.3 Message schema

`sender` and `recipient` both reference `User`, including the bot user. The
new `authorType` field makes the message meaning explicit:

```js
authorType: {
  type: String,
  enum: ["user", "bot"],
  default: "user",
  index: true,
}
```

The user's message is saved like this:

```js
await Message.create({
  text,
  sender: socket.user.id,
  recipient: botUser._id,
  authorType: "user",
});
```

The bot reply is saved like this:

```js
await Message.create({
  text: reply,
  sender: botUser._id,
  recipient: userId,
  authorType: "bot",
});
```

Both records are in the same `messages` collection. The existing
`Message.between(a, b)` query returns them oldest first, so refresh/reopen keeps
the complete conversation.

### 3.4 Calling the AI gateway

The browser sends only a Socket.IO event. The server builds the AI history and
calls the gateway from `server/chatbot.js`:

```js
const res = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CHATBOT_API_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.CHATBOT_MODEL,
    messages: [
      { role: "system", content: "You are a helpful teaching assistant." },
      ...history,
    ],
    temperature: 0.7,
  }),
  signal: AbortSignal.timeout(20_000),
});
```

The last 20 saved messages are converted to the standard roles `user` and
`assistant`. This gives the bot short-term conversation memory without sending
the entire database history on every request.

### 3.5 Socket.IO flow

The important server handler is:

```js
socket.on("chat:send", async ({ to, text } = {}, ack) => {
  text = String(text ?? "").trim();
  if (!text) return ack?.({ error: "Text required" });

  const message = await Message.create({
    text,
    sender: socket.user.id,
    recipient: to,
    authorType: "user",
  });

  io.to(socket.user.id).to(to).emit("chat:message", message);
  ack?.({ ok: true });

  const recipient = await User.findById(to).select("role");
  if (recipient?.role === "bot") {
    await replyAsBot(io, socket.user.id, recipient);
  }
});
```

`replyAsBot()` emits a typing event, calls the model, saves the bot reply, and
emits the normal `chat:message` event. The AI request starts immediately, but
the typing indicator waits one second by default. Change
`CHATBOT_TYPING_DELAY_MS` in `server/.env` if you want a longer classroom demo:

```dotenv
CHATBOT_TYPING_DELAY_MS=2000
```

The server clears the timer when a fast reply arrives, so the indicator is not
shown unnecessarily:

```js
setTimeout(() => {
  io.to(userId).emit("chat:typing", {
    from: botUser._id,
    isTyping: true,
  });
}, 1000);
// call the model and save the reply
io.to(userId).emit("chat:message", payload);
io.to(userId).emit("chat:typing", {
  from: botUser._id,
  isTyping: false,
});
```

Typing for human-to-human chats uses the same event. The server forwards the
event only to the intended recipient; it never sends the provider key to the
browser.

## 4. Run the complete live demo

Open three terminals.

Terminal 1, MongoDB:

```bash
mongod
```

Terminal 2, server:

```bash
cd server
npm install
npm run seed:chatbot
npm run dev
```

Terminal 3, client:

```bash
cd client
npm install
npm run dev
```

Then:

1. Open the Vite URL, normally `http://localhost:5173`.
2. Register or log in.
3. Open **Chat**. The `Chatbot` is loaded from `GET /chat/users`.
4. Send: `Explain the difference between MongoDB and SQL in three points.`
5. Show the animated **is typing** indicator.
6. Refresh or close/reopen the thread to prove messages came from MongoDB.
7. Ask a follow-up question to demonstrate the last 20 messages of context.
8. Open a second browser/incognito window with a second account to demo
   human-to-human chat and human typing indicators.

## 5. Test the API without the React app

OpenRouter example:

```bash
export OPENROUTER_API_KEY="replace-me"

curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/free",
    "messages": [
      {"role": "user", "content": "Say hello in one sentence."}
    ]
  }'
```

Expected response shape:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello!"
      }
    }
  ]
}
```

This is why the server reads `choices[0].message.content` and why the same
server code can work with any compatible provider.

## 6. Useful official links for students

### OpenRouter

- [OpenRouter home](https://openrouter.ai/)
- [OpenRouter quickstart](https://openrouter.ai/docs/quickstart)
- [Chat completions API reference](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request)
- [All models](https://openrouter.ai/models)
- [Free models](https://openrouter.ai/models?pricing=free)
- [List models API](https://openrouter.ai/docs/api/api-reference/models/get-models)
- [OpenRouter FAQ and limits](https://openrouter.ai/docs/faq)
- [OpenRouter pricing](https://openrouter.ai/pricing)

### OpenCode

- [OpenCode home](https://opencode.ai/)
- [OpenCode documentation](https://opencode.ai/docs/)
- [Installation](https://opencode.ai/docs/#install)
- [Configuration/providers](https://opencode.ai/docs/providers)
- [OpenCode Zen](https://opencode.ai/docs/zen)
- [OpenCode Zen models API](https://opencode.ai/zen/v1/models)
- [OpenCode Go](https://opencode.ai/docs/go/)
- [OpenCode Go models API](https://opencode.ai/zen/go/v1/models)
- [OpenCode auth](https://opencode.ai/auth)
- [OpenCode GitHub repository](https://github.com/anomalyco/opencode)
- [OpenCode releases](https://github.com/anomalyco/opencode/releases)
- [OpenCode SDK docs](https://opencode.ai/docs/sdk/)
- [OpenCode server docs](https://opencode.ai/docs/server/)
- [OpenCode Discord](https://opencode.ai/discord)

### AgentRouter

- [AgentRouter home](https://agentrouter.org/)
- [AgentRouter API base](https://agentrouter.org/v1)
- [AgentRouter model list endpoint](https://agentrouter.org/v1/models)

Check each provider's current documentation, model availability, data policy,
and rate limit before teaching a live class. Provider endpoints, free models,
and limits can change.

## 7. Teaching extensions

Once the base demo works, students can add:

- streaming responses with `stream: true` and server-sent events;
- a database-backed system prompt per classroom;
- message pagination instead of the current 200-message conversation cap;
- per-user rate limiting and request cancellation;
- Markdown rendering with sanitization;
- moderation and prompt-injection tests;
- an admin page showing model usage and failures.

Keep the same rule for all extensions: the provider key stays on the server.
