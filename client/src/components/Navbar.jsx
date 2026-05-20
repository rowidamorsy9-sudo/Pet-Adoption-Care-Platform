// ─── client/src/components/Navbar.jsx ────────────────────────────────────────
// CHANGES FROM ORIGINAL:
//   • user-circle button now shows profile image (if one is stored in localStorage)
//     instead of always showing a letter initial.
//   • Clicking the avatar navigates to /profile.
//   • All other logic (cart, wishlist, logout, admin link) is UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const API_BASE = "http://localhost:4000";

function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const [wishCount, setWishCount] = useState(0);
    const [user,      setUser]      = useState(null);
    const navigate = useNavigate();

    // Re-read localStorage whenever storageUpdated fires (or on mount)
    const updateData = () => {
        setCartCount((JSON.parse(localStorage.getItem("petCart"))     || []).length);
        setWishCount((JSON.parse(localStorage.getItem("petWishlist")) || []).length);
        setUser(JSON.parse(localStorage.getItem("user")));
    };

    useEffect(() => {
        updateData();
        window.addEventListener("storageUpdated", updateData);
        return () => window.removeEventListener("storageUpdated", updateData);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storageUpdated"));
        navigate("/login");
    };

    // Build the avatar image src (if the user has uploaded a profile picture)
    // user.profileImage is just the filename, e.g. "1716000000000-abc.jpg"
    const avatarSrc = user?.profileImage
        ? `${API_BASE}/uploads/profiles/${user.profileImage}`
        : null;

    return (
        <nav className="navbar">
            <Link to="/" className="logo">PawHome 🐾</Link>

            <div className="nav-center">
                <Link to="/">Home</Link>
                <Link to="/pets">Pets</Link>
                <Link to="/adoption-tips">Adoption Tips</Link>
                <Link to="/my-applications">My Applications</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>

                {/* Admin link — only visible to admin users — UNCHANGED */}
                {user?.role === "admin" && (
                    <Link to="/admin" className="admin-nav-link">⚙️ Admin</Link>
                )}
            </div>

            <div className="nav-right">
                <Link to="/wishlist" className="icon-link">❤️<span>{wishCount}</span></Link>
                <Link to="/cart"     className="icon-link">🛒<span>{cartCount}</span></Link>

                {user ? (
                    <div className="user-menu">
                        {/*
                          Clicking the avatar goes to /profile.
                          If the user has a profile image it shows that;
                          otherwise falls back to the first-letter circle.
                        */}
                        <button
                            className="user-circle"
                            onClick={() => navigate("/profile")}
                            title="View profile"
                        >
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={user.name}
                                    className="navbar-avatar-img"
                                />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </button>
                        <button className="logout-btn" onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="login-btn">Login / Register</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;