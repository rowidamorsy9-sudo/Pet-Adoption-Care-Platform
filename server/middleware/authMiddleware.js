const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Verify JWT and attach user to request ────────────────────────────────────
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "pawHome_super_secret_jwt_key_2024");
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired. Please log in again." });
            }
            return res.status(401).json({ message: "Invalid token." });
        }

        // Fetch fresh user data (in case role changed since token was issued)
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("verifyToken error:", error);
        res.status(500).json({ message: "Server error during authentication." });
    }
};

// ─── Require admin role (must come after verifyToken) ─────────────────────────
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

module.exports = { verifyToken, requireAdmin };