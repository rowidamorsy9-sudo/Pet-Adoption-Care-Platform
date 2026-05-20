const express = require("express");
const router = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { getAllApplications, approveApplication, rejectApplication } = require("../controllers/adminApplicationController");

// All routes require valid JWT + admin role
router.use(verifyToken, requireAdmin);

router.get("/",              getAllApplications);
router.patch("/:id/approve", approveApplication);
router.patch("/:id/reject",  rejectApplication);

module.exports = router;
