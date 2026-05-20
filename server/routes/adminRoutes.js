const express = require("express");
const router = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { getDashboardStats, getAllUsers, deleteUser } = require("../controllers/adminController");

// All routes below require a valid JWT AND role === "admin"
router.use(verifyToken, requireAdmin);

// GET  /api/admin/dashboard  — summary statistics
router.get("/dashboard", getDashboardStats);

// GET  /api/admin/users      — list all users
router.get("/users", getAllUsers);

// DELETE /api/admin/users/:id — remove a user
router.delete("/users/:id", deleteUser);

module.exports = router;