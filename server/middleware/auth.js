const jwt = require("jsonwebtoken");
function protect(req, res, next) {
  let token = req.cookies.token; // 1. browser

  //   const header = req.headers["authorization"];
  //   if (!token && header && header.startsWith("Bearer "))
  //     token = header.split(" ")[1];     // 2. Postman/mobile

  if (!token)
    return res.status(401).json({ success: false, message: "No token" });

  try {
    // jwt.verify(token, process.env.JWT_SECRET) => id, role, exp,
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = { id, role }
    next(); // next request
  } catch {
    res.status(401).json({ msg: "Token invalid or expired" });
  }
}

module.exports = { protect };
