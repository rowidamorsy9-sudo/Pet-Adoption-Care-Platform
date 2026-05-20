import React from "react";

// Reusable stat card — used in AdminDashboard
function DashboardCard({ icon, label, value, color = "blue" }) {
    return (
        <div className={`stat-card stat-${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-body">
                <span className="stat-value">{value ?? "—"}</span>
                <span className="stat-label">{label}</span>
            </div>
        </div>
    );
}

export default DashboardCard;
