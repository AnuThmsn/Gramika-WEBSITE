// Load env FIRST (very important)
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Connect DB --------------------
connectDB();

// Log configured LibreTranslate URL to help diagnose connectivity issues
const configuredLibre = process.env.LIBRETRANSLATE_URL || 'http://localhost:5001';
console.log(`LibreTranslate URL: ${configuredLibre}`);

// -------------------- STATIC FILES (IMPORTANT) --------------------
// This makes images accessible via:
// http://localhost:5000/api/uploads/<filename>
// Mount GridFS-backed uploads router first so streaming endpoints work
app.use("/api/uploads", require("./routes/uploads"));

// Fallback: serve local filesystem uploads (images) from server/uploads
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Routes --------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/carts", require("./routes/carts"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/translate", require("./routes/translate"));

// -------------------- Health check --------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// -------------------- Start server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});