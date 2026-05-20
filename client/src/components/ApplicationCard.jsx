import React from "react";
import "./ApplicationCard.css";

// Reusable card for a single adoption application
function ApplicationCard({ application, onApprove, onReject, actionId }) {
    const { _id, petName, userName, userEmail, phone, address, reason, status, createdAt } = application;

    const isLoading = actionId === _id;
    const statusClass = { pending: "status-pending", approved: "status-approved", rejected: "status-rejected" }[status] || "status-pending";

    return (
        <div className={`app-card ${statusClass}-border`}>
            {/* Header */}
            <div className="app-card-header">
                <h3 className="app-pet-name">🐾 {petName || "Unknown Pet"}</h3>
                <span className={`app-status-badge ${statusClass}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            {/* Details */}
            <div className="app-card-body">
                <div className="app-detail-row"><span className="app-detail-label">Applicant</span><span className="app-detail-value">{userName}</span></div>
                <div className="app-detail-row"><span className="app-detail-label">Email</span><span className="app-detail-value">{userEmail}</span></div>
                <div className="app-detail-row"><span className="app-detail-label">Phone</span><span className="app-detail-value">{phone}</span></div>
                <div className="app-detail-row"><span className="app-detail-label">Address</span><span className="app-detail-value">{address}</span></div>
                <div className="app-detail-row"><span className="app-detail-label">Reason</span><span className="app-detail-value app-reason-text">{reason}</span></div>
                <div className="app-detail-row">
                    <span className="app-detail-label">Submitted</span>
                    <span className="app-detail-value">{new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="app-card-actions">
                {status !== "approved" && (
                    <button className="app-btn app-btn-approve" onClick={() => onApprove(_id)} disabled={isLoading}>
                        {isLoading ? <span className="app-btn-spinner" /> : "✓ Approve"}
                    </button>
                )}
                {status !== "rejected" && (
                    <button className="app-btn app-btn-reject" onClick={() => onReject(_id)} disabled={isLoading}>
                        {isLoading ? <span className="app-btn-spinner" /> : "✗ Reject"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ApplicationCard;
