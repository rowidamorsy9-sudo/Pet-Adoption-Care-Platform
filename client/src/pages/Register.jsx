import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors]     = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading]   = useState(false);

    // ── Inline validation ────────────────────────────────────────────────────
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim() || formData.name.trim().length < 2)
            newErrors.name = "Name must be at least 2 characters.";

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!formData.email.trim())
            newErrors.email = "Email is required.";
        else if (!emailRegex.test(formData.email))
            newErrors.email = "Please enter a valid email address.";

        if (!formData.password)
            newErrors.password = "Password is required.";
        else if (formData.password.length < 6)
            newErrors.password = "Password must be at least 6 characters.";

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field-level error on change
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setApiError("");

        try {
            const res = await fetch("http://localhost:4000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setApiError(data.message || "Registration failed. Please try again.");
                return;
            }

            // Store token + user in localStorage (mirrors existing Navbar pattern)
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("storageUpdated"));

            navigate("/pets");
        } catch (err) {
            setApiError("Cannot reach the server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <span className="auth-paw">🐾</span>
                    <h1>Create Account</h1>
                    <p>Join PawHome and find your perfect companion</p>
                </div>

                {/* API error banner */}
                {apiError && <div className="auth-error-banner">{apiError}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Name */}
                    <div className={`auth-field ${errors.name ? "has-error" : ""}`}>
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="e.g. Jana Ahmed"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className={`auth-field ${errors.email ? "has-error" : ""}`}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className={`auth-field ${errors.password ? "has-error" : ""}`}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;