const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Bot users never log in, so they do not need a password.
    password: {
      type: String,
      required: function passwordRequired() {
        return this.role !== "bot";
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "bot"],
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
