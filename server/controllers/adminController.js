const User = require("../models/User");
const Pet = require("../models/Pet");
const Application = require("../models/Application");

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalPets, totalApplications, pendingApplications, approvedApplications, rejectedApplications] = await Promise.all([
            User.countDocuments({ role: "user" }),
            Pet.countDocuments(),
            Application.countDocuments(),
            Application.countDocuments({ status: "pending" }),
            Application.countDocuments({ status: "approved" }),
            Application.countDocuments({ status: "rejected" }),
        ]);

        res.status(200).json({
            totalUsers,
            totalPets,
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
        });
    } catch (error) {
        console.error("getDashboardStats error:", error);
        res.status(500).json({ message: "Failed to load dashboard stats." });
    }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("getAllUsers error:", error);
        res.status(500).json({ message: "Failed to fetch users." });
    }
};

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account." });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: `User ${user.email} deleted successfully.` });
    } catch (error) {
        console.error("deleteUser error:", error);
        res.status(500).json({ message: "Failed to delete user." });
    }
};

module.exports = { getDashboardStats, getAllUsers, deleteUser };
