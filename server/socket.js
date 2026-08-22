const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { parseCookie } = require("cookie");
const mongoose = require("mongoose");
const Message = require("./models/Message");
require("./models/User"); // Registers User for populate().

const isId = (value) => mongoose.isValidObjectId(value); // valide id132222 -> bad user id, 600382jaajdjdkssksjs -> valid

async function sendHistory(socket, withUser, ack) {
  try {
    if (!isId(withUser)) return ack?.({ error: "Bad user id" });

    const messages = await Message.between(socket.user.id, withUser).populate(
      "sender",
      "name",
    );

    // message sender id, reciever

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

        // message= hi
        // to = "680910222222"

        text = String(text ?? "").trim();
        if (!text) return ack?.({ error: "Text required" });
        if (text.length > 2000) return ack?.({ error: "Message too long" });

        const message = await Message.create({
          text,
          sender: socket.user.id,
          recipient: to,
        });

        // hi,sender: "7389303030303", recipit: "jjsjskdmddd"

        await message.populate("sender", "name");

        // Sending to both rooms updates both participants immediately.
        // room_1 -> to: jjsjskdmddd, message hi,sender: "7389303030303", recipit: "jjsjskdmddd"
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
