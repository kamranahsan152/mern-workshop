require("dotenv").config();

const express = require("express");
const server = express();

const { connectDB } = require("./config/db");
const Note = require("./models/Note");
const { auth } = require("./routes/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const chatRoutes = require("./routes/chat");
const http = require("http");
const { initSocket } = require("./socket");
const { ensureBotUser } = require("./chatbot");

server.use(express.json()); // Middleware to parse JSON request bodies
server.use(cookieParser()); // fills req.cookies
server.use(
  cors({
    origin: process.env.CLIENT_URL, // exact, never "*"
    credentials: true, // allow the cookie
  }),
);

// Every route below needs the DB; on serverless the connection may not be up
// yet when a request arrives, so wait for it here instead of at startup.
server.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ success: false, msg: "Database unavailable" });
  }
});

server.use(auth);
server.use("/chat", chatRoutes);

server.use("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy api" });
});

server.get("/", (req, res) => {
  console.log("Name, mongodb");
  res.send("Hello, World!");
});

connectDB()
  .then(() => ensureBotUser())
  .catch((error) => {
    console.error("Database startup failed:", error.message);
  });

server.get("/notes", async (req, res) => {
  const notes = await Note.find();
  res.status(200).json({
    success: true,
    notes,
  });
});

server.post("/notes", async (req, res) => {
  const notes = await Note.create(req.body);
  res.status(201).json({
    success: true,
    notes,
  });
});

server.delete("/notes/:id", async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  res.status(200).json({
    success: true,
    note,
  });
});

server.put("/notes/:id", async (req, res) => {
  const note = await Note.findOneAndUpdate({ _id: req.params.id }, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: "Note not found",
    });
  }

  res.status(200).json({
    success: true,
    note,
  });
});

const httpServer = http.createServer(server);
initSocket(httpServer);

// Vercel imports this module and invokes the export per request; it never
// runs a long-lived listener. Locally we still need one.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = server;
