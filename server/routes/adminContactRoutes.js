const express = require("express");
const router = express.Router();
const { getAllMessages, replyToMessage } = require("../controllers/contactController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken, requireAdmin);

// GET  /api/admin/contact-messages
router.get("/",           getAllMessages);

// PUT  /api/admin/contact-messages/:id/reply
router.put("/:id/reply",  replyToMessage);

module.exports = router;
