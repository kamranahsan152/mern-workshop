const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken, cookieOptions, publicUser } = require("../utils/helper");

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
    const campare = await bcrypt.campare(password, user.password);

    if (!campare) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    res
      .cookie("token", signToken(user), cookieOptions)
      .status(200)
      .json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  login,
  register,
};
