// -----------------------------------------------------------------------------
// paths.js
// One single place that knows WHERE the uploads folder lives.
// Every other file imports from here, so we never build a path by hand.
// -----------------------------------------------------------------------------
const path = require("path");
const fs = require("fs");

// __dirname = .../server/src/utils   ->  go up twice  ->  .../server/uploads
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

// Create the folder on boot if it does not exist yet.
// { recursive: true } means "create parent folders too, and don't crash if it exists".
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

module.exports = { UPLOAD_DIR };
