const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { parseCookie } = require("cookie");
const mongoose = require("mongoose");
const Message = require("./models/Message");
require("./models/User"); // Registers User for populate().

const isId = (value) => mongoose.isValidObjectId(value);

async function sendHistory(socket, withUser, ack) {
  try {
    if (!isId(withUser)) return ack?.({ error: "Bad user id" });

    const messages = await Message.between(socket.user.id, withUser).populate(
      "sender",
      "name",
    );

    ack?.({ ok: true, messages });
  } catch (err) {
    ack?.({ error: err.message });
  }
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Reject unauthenticated sockets during the handshake.
  io.use((socket, next) => {
    try {
      const { token } = parseCookie(socket.handshake.headers.cookie ?? "");
      if (!token) return next(new Error("No token"));

      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Token invalid or expired"));
    }
  });

  io.on("connection", (socket) => {
    // All tabs/devices for this user share this room.
    socket.join(socket.user.id);

    socket.on("chat:history", (withUser, ack) =>
      sendHistory(socket, withUser, ack),
    );

    socket.on("chat:send", async ({ to, text } = {}, ack) => {
      try {
        if (!isId(to)) return ack?.({ error: "Bad recipient" });

        text = String(text ?? "").trim();
        if (!text) return ack?.({ error: "Text required" });
        if (text.length > 2000) return ack?.({ error: "Message too long" });

        const message = await Message.create({
          text,
          sender: socket.user.id,
          recipient: to,
        });

        await message.populate("sender", "name");

        // Sending to both rooms updates both participants immediately.
        io.to(socket.user.id).to(to).emit("chat:message", message);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ error: err.message });
      }
    });
  });

  return io;
}

module.exports = { initSocket };
