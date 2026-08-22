const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Find both directions of one conversation, oldest first.
messageSchema.statics.between = function (a, b) {
  return this.find({
    $or: [
      { sender: a, recipient: b },
      { sender: b, recipient: a },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(200);
};

module.exports = mongoose.model("Message", messageSchema);
