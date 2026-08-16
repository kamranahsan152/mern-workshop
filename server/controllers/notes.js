const Note = require("../models/Note");

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const note = await Note.create({
      title: req.body.title,
      body: req.body.body,
      owner: req.user.id,
    });

    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { title: req.body.title, body: req.body.body },
      { new: true, runValidators: true },
    );

    if (!note) return res.status(404).json({ msg: "Not found" });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!note) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
