const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { parseCookie } = require("cookie");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const User = require("./models/User");
const { askBot } = require("./chatbot");

const isId = (value) => mongoose.isValidObjectId(value);

async function sendHistory(socket, withUser, ack) {
  try {
    if (!isId(withUser)) return ack?.({ error: "Bad user id" });
    if (!(await User.exists({ _id: withUser })))
      return ack?.({ error: "User not found" });

    const messages = await Message.between(socket.user.id, withUser).populate(
      "sender",
      "name",
    );

    ack?.({ ok: true, messages });
  } catch (err) {
    ack?.({ error: err.message });
  }
}

async function replyAsBot(io, userId, botUser) {
  const botId = botUser._id.toString();
  const typingDelayMs = Math.max(
    0,
    Number.parseInt(process.env.CHATBOT_TYPING_DELAY_MS || "1000", 10),
  );
  let typingShown = false;
  const typingTimer = setTimeout(() => {
    typingShown = true;
    io.to(userId).emit("chat:typing", {
      from: botId,
      isTyping: true,
    });
  }, typingDelayMs);

  let reply;
  try {
    const history = await Message.between(userId, botId).lean();
    const aiMessages = history.slice(-20).map((message) => ({
      role: message.authorType === "bot" ? "assistant" : "user",
      content: message.text,
    }));
    reply = await askBot(aiMessages);
  } catch (err) {
    console.error("Chatbot reply failed:", err.message);
    reply = "Sorry, I couldn't reach the AI service right now.";
  }

  try {
    const message = await Message.create({
      text: reply,
      sender: botId,
      recipient: userId,
      authorType: "bot",
    });

    await message.populate("sender", "name role");
    const payload = message.toObject();
    io.to(userId).emit("chat:message", payload);
  } finally {
    clearTimeout(typingTimer);
    if (typingShown) {
      io.to(userId).emit("chat:typing", {
        from: botId,
        isTyping: false,
      });
    }
  }
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Reject unauthenticated sockets during the handshake.
  io.use((socket, next) => {
    try {
      // cookies ejsodododododododododod
      // get token
      /// ejsodododododododododod
      const { token } = parseCookie(socket.handshake.headers.cookie ?? "");
      if (!token) return next(new Error("No token"));

      socket.user = jwt.verify(token, process.env.JWT_SECRET); // id;
      // socket.user.id = "68100020202"
      next();
    } catch {
      next(new Error("Token invalid or expired"));
    }
  });

  io.on("connection", (socket) => {
    // socket.id // hshhshshs
    // All tabs/devices for this user share this room.
    socket.join(socket.user.id); // room_1

    // chat:history trigger
    socket.on("chat:history", (withUser, ack) =>
      sendHistory(socket, withUser, ack),
    );

    // user press sender button => text = "hi" to: "6819290202022"
    socket.on("chat:send", async ({ to, text } = {}, ack) => {
      try {
        if (!isId(to)) return ack?.({ error: "Bad recipient" });
        const recipient = await User.findById(to).select("name role");
        if (!recipient) return ack?.({ error: "Recipient not found" });

        // message= hi
        // to = "680910222222"

        text = String(text ?? "").trim();
        if (!text) return ack?.({ error: "Text required" });
        if (text.length > 2000) return ack?.({ error: "Message too long" });

        const message = await Message.create({
          text,
          sender: socket.user.id,
          recipient: to,
          authorType: "user",
        });

        await message.populate("sender", "name");

        // Sending to both rooms updates both participants immediately.
        io.to(socket.user.id).to(to).emit("chat:message", message);
        ack?.({ ok: true });

        if (recipient.role === "bot")
          await replyAsBot(io, socket.user.id, recipient);
      } catch (err) {
        ack?.({ error: err.message });
      }
    });

    socket.on("chat:typing", async ({ to, isTyping } = {}) => {
      if (!isId(to)) return;
      const recipient = await User.findById(to).select("role");
      if (!recipient || recipient.role === "bot") return;
      io.to(to).emit("chat:typing", {
        from: socket.user.id,
        isTyping: Boolean(isTyping),
      });
    });
  });

  return io;
}

module.exports = { initSocket };
