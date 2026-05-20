// ─── server/index.js ─────────────────────────────────────────────────────────
// CHANGES FROM ORIGINAL:
//   • Added `app.use("/uploads", express.static(...))` so the browser can fetch
//     uploaded profile images at /uploads/profiles/<filename>.
//   • Everything else is UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");   // ← NEW: needed for static file path
require("dotenv").config();

const petRoutes              = require("./routes/petRoutes");
const applicationRoutes      = require("./routes/applicationRoutes");
const authRoutes             = require("./routes/authRoutes");
const adminRoutes            = require("./routes/adminRoutes");
const petManageRoutes        = require("./routes/petManageRoutes");
const userRoutes             = require("./routes/userRoutes");
const adminApplicationRoutes = require("./routes/adminApplicationRoutes");
const contactRoutes          = require("./routes/contactRoutes");
const adminContactRoutes     = require("./routes/adminContactRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ── NEW: Serve uploaded files as static assets ────────────────────────────────
// Any GET /uploads/profiles/<filename> will be resolved to:
//   <project-root>/server/uploads/profiles/<filename>
// This is how the React app displays the user's profile image.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ─────────────────────────────────────────────────────────────────────────────

app.get("/test", (req, res) => res.json({ message: "Server is working" }));

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

app.use("/api/pets",                   petRoutes);
app.use("/api/applications",           applicationRoutes);
app.use("/api/auth",                   authRoutes);
app.use("/api/admin",                  adminRoutes);
app.use("/api/pet-manage",             petManageRoutes);
app.use("/api/users",                  userRoutes);
app.use("/api/admin/applications",     adminApplicationRoutes);
app.use("/api/contact",                contactRoutes);
app.use("/api/admin/contact-messages", adminContactRoutes);

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));