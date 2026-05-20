const ContactMessage = require("../models/ContactMessage");

// ─── POST /api/contact — user submits a contact message ──────────────────────
const submitMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newMsg = new ContactMessage({
            name,
            email,
            subject,
            message,
            // Attach userId if the user is logged in (token optional on this route)
            userId: req.user?._id || null,
        });

        await newMsg.save();
        res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("submitMessage error:", error);
        res.status(500).json({ message: "Failed to send message." });
    }
};

// ─── GET /api/contact/my-messages — logged-in user sees their own messages ───
const getMyMessages = async (req, res) => {
    try {
        // Match by userId if available, otherwise fall back to email
        const messages = await ContactMessage.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("getMyMessages error:", error);
        res.status(500).json({ message: "Failed to fetch messages." });
    }
};

// ─── GET /api/admin/contact-messages — admin gets all messages ────────────────
const getAllMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("getAllMessages error:", error);
        res.status(500).json({ message: "Failed to fetch messages." });
    }
};

// ─── PUT /api/admin/contact-messages/:id/reply — admin replies ────────────────
const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || !reply.trim()) {
            return res.status(400).json({ message: "Reply text is required." });
        }

        const updated = await ContactMessage.findByIdAndUpdate(
            id,
            { adminReply: reply, status: "replied", repliedAt: new Date() },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Message not found." });

        res.status(200).json({ message: "Reply sent successfully!", contactMessage: updated });
    } catch (error) {
        console.error("replyToMessage error:", error);
        res.status(500).json({ message: "Failed to send reply." });
    }
};

module.exports = { submitMessage, getMyMessages, getAllMessages, replyToMessage };
