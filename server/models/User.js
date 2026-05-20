// ─── server/models/User.js ────────────────────────────────────────────────────
// CHANGES FROM ORIGINAL:
//   • Added `profileImage` field to store the uploaded image filename.
//   • Everything else (name, email, password, role, phone, address) is UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        phone: {
            type: String,
            default: "",
            trim: true,
        },
        address: {
            type: String,
            default: "",
            trim: true,
        },

        // ── NEW FIELD ──────────────────────────────────────────────────────────
        // Stores the filename of the uploaded profile picture (e.g. "abc123.jpg").
        // We keep only the filename, not the full path, so the server can serve it
        // via the /uploads/profiles/ static route regardless of where the app runs.
        profileImage: {
            type: String,
            default: "",   // empty string = no image uploaded yet
        },
        // ──────────────────────────────────────────────────────────────────────
    },
    { timestamps: true }
);

// Hash password before saving — UNCHANGED
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password with hashed — UNCHANGED
userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);