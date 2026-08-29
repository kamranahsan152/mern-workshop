// -----------------------------------------------------------------------------
// filename.js
// SECURITY RULE #1 OF FILE UPLOADS: never trust the name the browser sends you.
//
// A malicious client can send a "filename" like:
//     ../../server.js          -> path traversal, overwrite your own code
//     photo.jpg.php            -> double extension, tries to get executed
//     <script>.png             -> weird characters that break other tools
//
// So we THROW AWAY the original name for storage and generate our own.
// We still remember the original name and send it back to the UI for display.
// -----------------------------------------------------------------------------
const crypto = require("crypto");
const path = require("path");

// Only these extensions are ever written to disk.
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];

/**
 * Build a safe, unique filename for a stored file.
 * Example output: 1724930012345-3f9a1c2b8e7d4506.jpg
 */
function makeSafeFilename(originalName) {
  // path.extname on the ORIGINAL name only to learn the file type.
  // path.basename() first strips any "../" or folder part -> traversal is impossible.
  const cleanName = path.basename(String(originalName || ""));
  let ext = path.extname(cleanName).toLowerCase();

  // If the extension is missing or not on our allow-list, fall back to .jpg
  // rather than trusting whatever the client claimed.
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    ext = ".jpg";
  }

  // Date.now() keeps names roughly sorted; the random hex makes collisions
  // effectively impossible even when 20 files arrive in the same millisecond.
  const unique = crypto.randomBytes(8).toString("hex");

  return `${Date.now()}-${unique}${ext}`;
}

module.exports = { makeSafeFilename, ALLOWED_EXTENSIONS };
