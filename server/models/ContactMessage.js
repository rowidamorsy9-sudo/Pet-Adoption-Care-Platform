const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
    {
        name:    { type: String, required: true, trim: true },
        email:   { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },

        // Optional: link to a logged-in user
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        status: {
            type: String,
            enum: ["unread", "replied"],
            default: "unread",
        },

        adminReply: { type: String, default: "" },
        repliedAt:  { type: Date,   default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
