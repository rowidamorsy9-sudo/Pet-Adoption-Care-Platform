// ─── server/controllers/userController.js ────────────────────────────────────
// CHANGES FROM ORIGINAL:
//   • getProfile  – now also returns `profileImage` in response.
//   • updateProfile – now supports email change + password change (NEW).
//   • uploadProfileImage – NEW endpoint to handle profile picture uploads.
//   • getAllUsers / updateUser – UNCHANGED (admin functions).
// ─────────────────────────────────────────────────────────────────────────────

const User = require("../models/User");
const path = require("path");
const fs   = require("fs");

// ─── GET /api/users/profile ───────────────────────────────────────────────────
// Returns the logged-in user's full profile (password excluded).
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
// Allows the logged-in user to update: name, phone, address, email, password.
// Each field is optional — only provided fields are updated.
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, email, currentPassword, newPassword } = req.body;

        // --- Validation ---
        if (name && name.trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters." });
        }

        if (email) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Please enter a valid email address." });
            }

            // Make sure the new email isn't already taken by another user
            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing && existing._id.toString() !== req.user._id.toString()) {
                return res.status(409).json({ message: "This email is already in use by another account." });
            }
        }

        // --- Build update object for simple fields ---
        const updateFields = {};
        if (name    !== undefined) updateFields.name    = name;
        if (phone   !== undefined) updateFields.phone   = phone;
        if (address !== undefined) updateFields.address = address;
        if (email   !== undefined) updateFields.email   = email.toLowerCase();

        // --- Password change (requires currentPassword for security) ---
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Please provide your current password to set a new one." });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters." });
            }

            // Load the full user doc (with password) to verify the current one
            const userWithPass = await User.findById(req.user._id);
            const isMatch = await userWithPass.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: "Current password is incorrect." });
            }

            // Update the password directly on the document so the pre-save hook hashes it
            userWithPass.password = newPassword;

            // Apply other field changes to the same document
            Object.assign(userWithPass, updateFields);
            await userWithPass.save();   // triggers bcrypt hashing

            const updated = await User.findById(req.user._id).select("-password");
            return res.status(200).json({ message: "Profile updated successfully!", user: updated });
        }

        // --- No password change: use findByIdAndUpdate (more efficient) ---
        const updated = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({ message: "Profile updated successfully!", user: updated });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "This email is already in use." });
        }
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};

// ─── POST /api/users/profile/image ───────────────────────────────────────────
// Handles profile picture uploads. Multer middleware (defined in userRoutes.js)
// saves the file to /uploads/profiles/ and puts file info on req.file.
// This controller just saves the filename to the user's document in MongoDB.
const uploadProfileImage = async (req, res) => {
    try {
        // req.file is provided by Multer middleware
        if (!req.file) {
            return res.status(400).json({ message: "No image file received." });
        }

        // Find the user and delete their old profile image file (if any)
        const user = await User.findById(req.user._id);
        if (user.profileImage) {
            const oldImagePath = path.join(__dirname, "../uploads/profiles", user.profileImage);
            // Delete old file only if it actually exists (fs.existsSync prevents crashes)
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Save only the filename (e.g. "1716000000000-abc123.jpg") — not the full path
        user.profileImage = req.file.filename;
        await user.save({ validateBeforeSave: false }); // skip full validation for this small update

        // Return the URL path the browser can use to fetch the image
        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        res.status(200).json({
            message: "Profile image updated successfully!",
            imageUrl,
            user: {
                id:           user._id,
                name:         user.name,
                email:        user.email,
                role:         user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Image upload failed.", error: error.message });
    }
};

// ─── GET /api/users/all (admin only) — UNCHANGED ─────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users.", error: error.message });
    }
};

// ─── PUT /api/users/:id (admin edits any user) — UNCHANGED ───────────────────
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;

        if (name && name.trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters." });
        }

        const updateFields = {};
        if (name  !== undefined) updateFields.name  = name;
        if (email !== undefined) updateFields.email = email;
        if (phone !== undefined) updateFields.phone = phone;
        if (role  !== undefined) updateFields.role  = role;

        const updated = await User.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ message: "User not found." });

        res.status(200).json({ message: "User updated successfully!", user: updated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already in use." });
        }
        res.status(500).json({ message: "Failed to update user.", error: error.message });
    }
};

module.exports = { getProfile, updateProfile, uploadProfileImage, getAllUsers, updateUser };