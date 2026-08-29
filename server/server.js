// -----------------------------------------------------------------------------
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { UPLOAD_DIR } = require("./src/utils/paths");
const fileRoutes = require("./src/routes/fileRoutes");
const { errorHandler } = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// --- CORS: the React dev server is on port 5173, this API is on 5000.
// Different port = different origin, so the browser blocks it unless we allow it.
app.use(cors({ origin: CLIENT_ORIGIN }));

// --- Body parsers.
// IMPORTANT: express.json() does NOT handle file uploads. It only parses
// application/json. Multer handles multipart/form-data. Both can coexist.
app.use(express.json());

// --- STATIC FILE SERVING.
// This one line is what makes http://localhost:5000/uploads/abc.jpg work.
// Express looks for the requested filename inside UPLOAD_DIR and streams it back.
app.use("/uploads", express.static(UPLOAD_DIR));

// --- API routes
app.use("/api/files", fileRoutes);

// --- Health check, handy for students to confirm the server is alive
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Upload server is running" });
});

// --- 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --- Error handler goes LAST. Express only reaches it when something throws.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads served from /uploads`);
});
