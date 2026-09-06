const jwt = require("jsonwebtoken");

//security
const isProd = process.env.NODE_ENV === "production";

// Client and API live on different domains in production, so the cookie must
// be SameSite=None; browsers only accept that when Secure is also set.
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
});

module.exports = {
  cookieOptions,
  signToken,
  publicUser,
};
