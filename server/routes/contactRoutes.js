const express = require("express");
const router = express.Router();
const { submitMessage, getMyMessages } = require("../controllers/contactController");
const { verifyToken } = require("../middleware/authMiddleware");

// POST /api/contact — optional auth (userId saved if logged in)
router.post("/", verifyToken, submitMessage);

// GET /api/contact/my-messages — requires login
router.get("/my-messages", verifyToken, getMyMessages);

module.exports = router;
