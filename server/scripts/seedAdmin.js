require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const email = "admin@gmail.com";
const password = "admin123";
const name = "Admin";

async function run() {
  await mongoose.connect(process.env.DB_URL);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`Updated existing user ${email} to role=admin`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash, role: "admin" });
    console.log(`Created admin user ${email} / ${password}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
