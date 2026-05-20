import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors]     = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading]   = useState(false);

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!formData.email.trim())       newErrors.email    = "Email is required.";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address.";
        if (!formData.password)           newErrors.password = "Password is required.";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

        setLoading(true);
        setApiError("");

        try {
            const res  = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                setApiError(data.message || "Login failed. Please check your credentials.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user",  JSON.stringify(data.user));
            window.dispatchEvent(new Event("storageUpdated"));

            // ── Role-based redirect ──────────────────────────────────────────
            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/pets");
            }
        } catch (err) {
            setApiError("Cannot reach the server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-paw">🐾</span>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your adoption journey</p>
                </div>

                {apiError && <div className="auth-error-banner">{apiError}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className={`auth-field ${errors.email ? "has-error" : ""}`}>
                        <label htmlFor="email">Email Address</label>
                        <input id="email" name="email" type="email"
                            placeholder="you@example.com" value={formData.email}
                            onChange={handleChange} autoComplete="email" />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className={`auth-field ${errors.password ? "has-error" : ""}`}>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password"
                            placeholder="Your password" value={formData.password}
                            onChange={handleChange} autoComplete="current-password" />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : "Sign In"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;