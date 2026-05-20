import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * Props:
 *   requiredRole  — "admin" | "user" | undefined (any authenticated user)
 *   redirectTo    — where to send unauthenticated users (default: /login)
 */
function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }) {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");

    // Not logged in at all
    if (!token || !user) {
        return <Navigate to={redirectTo} replace />;
    }

    // Logged in but wrong role
    if (requiredRole && user.role !== requiredRole) {
        // Admins accidentally hitting a user-only page → send to admin panel
        if (user.role === "admin") return <Navigate to="/admin" replace />;
        // Regular users trying to access admin panel → send home
        return <Navigate to="/pets" replace />;
    }

    return children;
}

export default ProtectedRoute;