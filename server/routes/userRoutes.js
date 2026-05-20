// ─── server/routes/userRoutes.js ─────────────────────────────────────────────
// CHANGES FROM ORIGINAL:
//   • Added `multer` configuration for secure profile image uploads.
//   • Added POST /profile/image route (requires auth + multer middleware).
//   • All existing routes are UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const { getProfile, updateProfile, uploadProfileImage, getAllUsers, updateUser } =
    require("../controllers/userController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// ─── Multer configuration ─────────────────────────────────────────────────────
// Multer handles multipart/form-data (i.e., file uploads).
// We configure it to store files on disk in /uploads/profiles/.

// Make sure the upload folder exists — create it if it doesn't
const uploadDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// diskStorage lets us control the folder and the final filename
const storage = multer.diskStorage({
    // destination: where to save the file
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    // filename: timestamp + random number ensures unique filenames and prevents overwrites
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase(); // e.g. ".jpg"
        cb(null, uniqueSuffix + ext);  // e.g. "1716000000000-123456789.jpg"
    },
});

// fileFilter: only allow real image types (security check)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);   // accept the file
    } else {
        cb(new Error("Only image files (JPEG, PNG, WEBP, GIF) are allowed."), false);
    }
};

// Combine storage + filter + size limit into the multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max file size
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// User's own profile — UNCHANGED
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

// NEW: Profile image upload
// `upload.single("profileImage")` is middleware that reads the file from the
// "profileImage" field in the multipart form, saves it to disk, and puts the
// file info on req.file before calling our controller.
router.post(
    "/profile/image",
    verifyToken,
    upload.single("profileImage"),  // ← multer middleware
    uploadProfileImage              // ← our controller
);

// Admin only — UNCHANGED
router.get("/:id/all", verifyToken, requireAdmin, getAllUsers);  // keep old pattern
router.get("/all",     verifyToken, requireAdmin, getAllUsers);
router.put("/:id",     verifyToken, requireAdmin, updateUser);

module.exports = router;