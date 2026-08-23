const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken, cookieOptions, publicUser } = require("../utils/helper");
const { ensureBotUser } = require("../chatbot");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ msg: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
    });

    await ensureBotUser();

    res
      .cookie("token", signToken(user), cookieOptions)
      .status(201)
      .json({
        success: true,
        user: publicUser(user),
      });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please register yourself",
      });
    }
    if (user.role === "bot") {
      return res.status(403).json({ msg: "The chatbot account cannot log in" });
    }
    const campare = await bcrypt.compare(password, user.password);

    if (!campare) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Idempotent: it creates the one shared chatbot if the seed script has
    // not been run yet, so every newly logged-in user can see it.
    await ensureBotUser();

    res
      .cookie("token", signToken(user), cookieOptions)
      .status(200)
      .json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const details = async (req, res) => {
  //req.user {id, role}
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ msg: "No user" });
  res.json({ success: true, user: publicUser(user) });
};

const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ success: true, message: "Logged out" });
};

module.exports = {
  login,
  register,
  details,
  logout,
};
