require("dotenv").config();

const express = require("express");
const server = express();
const cors = require("cors");

const { connectDB } = require("./config/db");
const Note = require("./models/Note");

server.use(express.json()); // Middleware to parse JSON request bodies
server.use(cors());

server.get("/", (req, res) => {
  console.log("Name, mongodb");
  res.send("Hello, World!");
});

connectDB();

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

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
