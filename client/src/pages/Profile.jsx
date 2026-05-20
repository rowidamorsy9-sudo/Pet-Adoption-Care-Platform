// ─── client/src/pages/Profile.jsx ────────────────────────────────────────────
// Full User Profile page with:
//   • View current info
//   • Edit name, email, phone, address
//   • Change password (requires current password for security)
//   • Upload / change profile picture
//   • Updates Navbar avatar in real time via localStorage + storageUpdated event
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

// Base URL of the backend server
const API_BASE = "http://localhost:4000";

function Profile() {
    const navigate   = useNavigate();
    const token      = localStorage.getItem("token");
    const fileInputRef = useRef(null); // ref to trigger file picker programmatically

    // ── State ────────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name:    "",
        email:   "",
        phone:   "",
        address: "",
    });

    // Password fields are separate so they are never pre-filled
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword:     "",
        confirmPassword: "",
    });

    // The filename stored in DB (e.g. "1716000000000-abc.jpg") or ""
    const [profileImage, setProfileImage] = useState("");

    // Preview shown immediately after the user picks a file (before upload)
    const [imagePreview, setImagePreview] = useState(null);

    // The actual File object chosen by the user (used for upload)
    const [selectedFile, setSelectedFile] = useState(null);

    const [loading,        setLoading]        = useState(true);
    const [saving,         setSaving]          = useState(false);
    const [uploadingImage, setUploadingImage]  = useState(false);
    const [showPassword,   setShowPassword]    = useState(false); // toggle password section
    const [message,        setMessage]         = useState({ text: "", type: "" });

    // ── On mount: redirect if not logged in, else fetch profile ─────────────
    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        fetchProfile();
    }, []);

    // ── Fetch profile from backend ────────────────────────────────────────────
    const fetchProfile = async () => {
        try {
            const res  = await fetch(`${API_BASE}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { navigate("/login"); return; }

            setFormData({
                name:    data.name    || "",
                email:   data.email   || "",
                phone:   data.phone   || "",
                address: data.address || "",
            });
            setProfileImage(data.profileImage || "");
        } catch {
            setMessage({ text: "Cannot connect to server.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // ── Handle text input changes ─────────────────────────────────────────────
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ text: "", type: "" });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setMessage({ text: "", type: "" });
    };

    // ── Handle file selection (shows preview immediately) ─────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side validation before sending to server
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ text: "Only JPEG, PNG, WEBP, or GIF images are allowed.", type: "error" });
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2 MB
            setMessage({ text: "Image must be smaller than 2 MB.", type: "error" });
            return;
        }

        setSelectedFile(file);
        setMessage({ text: "", type: "" });

        // Create a temporary local preview URL (no upload yet)
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    // ── Upload image to backend ───────────────────────────────────────────────
    const handleImageUpload = async () => {
        if (!selectedFile) return;

        setUploadingImage(true);
        setMessage({ text: "", type: "" });

        try {
            // multipart/form-data — do NOT set Content-Type manually; the browser sets it
            const formDataObj = new FormData();
            formDataObj.append("profileImage", selectedFile);

            const res  = await fetch(`${API_BASE}/api/users/profile/image`, {
                method:  "POST",
                headers: { Authorization: `Bearer ${token}` },
                body:    formDataObj,
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ text: data.message || "Image upload failed.", type: "error" });
                return;
            }

            // Update state with the new image filename from the server
            setProfileImage(data.user.profileImage);
            setSelectedFile(null);
            setImagePreview(null);

            // Sync localStorage so the Navbar avatar updates
            syncLocalStorage({ profileImage: data.user.profileImage });

            setMessage({ text: "Profile image updated!", type: "success" });
        } catch {
            setMessage({ text: "Cannot connect to server.", type: "error" });
        } finally {
            setUploadingImage(false);
        }
    };

    // ── Cancel image selection (discard preview) ──────────────────────────────
    const handleCancelImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setMessage({ text: "", type: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Save profile info ─────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        // Build the request payload
        const payload = {
            name:    formData.name,
            email:   formData.email,
            phone:   formData.phone,
            address: formData.address,
        };

        // Include password fields only if the section is open and newPassword is filled
        if (showPassword && passwordData.newPassword) {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setMessage({ text: "New passwords do not match.", type: "error" });
                setSaving(false);
                return;
            }
            if (passwordData.newPassword.length < 6) {
                setMessage({ text: "New password must be at least 6 characters.", type: "error" });
                setSaving(false);
                return;
            }
            payload.currentPassword = passwordData.currentPassword;
            payload.newPassword     = passwordData.newPassword;
        }

        try {
            const res  = await fetch(`${API_BASE}/api/users/profile`, {
                method:  "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:  `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ text: data.message || "Update failed.", type: "error" });
                return;
            }

            // Sync the updated name & email to localStorage (Navbar reads from here)
            syncLocalStorage({ name: data.user.name, email: data.user.email });

            // Clear password fields after a successful password change
            if (payload.newPassword) {
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setShowPassword(false);
            }

            setMessage({ text: "Profile updated successfully!", type: "success" });
        } catch {
            setMessage({ text: "Cannot connect to server.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Merge new fields into the "user" object in localStorage and fire the event
    // so the Navbar re-renders without a page reload.
    const syncLocalStorage = (updates) => {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...updates }));
        window.dispatchEvent(new Event("storageUpdated"));
    };

    // Build the <img> src: if there's an uploaded image use the server URL,
    // otherwise fall back to null (the CSS avatar with initials will show instead).
    const imageSrc = imagePreview
        ? imagePreview                                          // local preview (before upload)
        : profileImage
            ? `${API_BASE}/uploads/profiles/${profileImage}`   // saved image from server
            : null;                                             // no image — show initials

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) return <div className="profile-loading">Loading...</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">

                {/* ── Avatar / Profile Picture ── */}
                <div className="profile-avatar-wrapper">
                    {/* Clicking the avatar opens the file picker */}
                    <div
                        className="profile-avatar"
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to change profile picture"
                    >
                        {imageSrc ? (
                            <img src={imageSrc} alt="Profile" className="profile-avatar-img" />
                        ) : (
                            // Fallback: show first letter of name
                            <span>{formData.name?.charAt(0).toUpperCase() || "?"}</span>
                        )}

                        {/* Hover overlay with camera icon */}
                        <div className="profile-avatar-overlay">📷</div>
                    </div>

                    {/* Hidden file input — triggered by clicking the avatar */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                    />

                    {/* Show upload/cancel buttons only when a file has been picked */}
                    {selectedFile && (
                        <div className="profile-image-actions">
                            <button
                                className="profile-upload-btn"
                                onClick={handleImageUpload}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? "Uploading…" : "Upload Photo"}
                            </button>
                            <button className="profile-cancel-btn" onClick={handleCancelImage}>
                                Cancel
                            </button>
                        </div>
                    )}

                    <p className="profile-avatar-hint">Click photo to change</p>
                </div>

                <h1>My Profile</h1>

                {/* ── Global message (success / error) ── */}
                {message.text && (
                    <div className={`profile-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* ── Profile form ── */}
                <form onSubmit={handleSubmit} className="profile-form">

                    {/* Full Name */}
                    <div className="profile-field">
                        <label>Full Name</label>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    {/* Email — now editable */}
                    <div className="profile-field">
                        <label>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="profile-field">
                        <label>Phone Number</label>
                        <input
                            name="phone"
                            type="text"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    {/* Address */}
                    <div className="profile-field">
                        <label>Address</label>
                        <input
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                        />
                    </div>

                    {/* ── Change Password (collapsible) ── */}
                    <div className="profile-password-section">
                        <button
                            type="button"
                            className="profile-toggle-password"
                            onClick={() => {
                                setShowPassword(!showPassword);
                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                            }}
                        >
                            {showPassword ? "▲ Cancel Password Change" : "🔒 Change Password"}
                        </button>

                        {showPassword && (
                            <div className="profile-password-fields">
                                <div className="profile-field">
                                    <label>Current Password</label>
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div className="profile-field">
                                    <label>New Password</label>
                                    <input
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Min 6 characters"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="profile-field">
                                    <label>Confirm New Password</label>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Repeat new password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="profile-save-btn" disabled={saving}>
                        {saving ? "Saving…" : "Save Changes"}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default Profile;