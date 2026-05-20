import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationCard from "../components/ApplicationCard";
import "./ManageApplications.css";

const API = "http://localhost:4000/api/admin/applications";

function ManageApplications() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [applications, setApplications] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState("");
    const [actionId,     setActionId]     = useState(null); // id currently being actioned

    const authHeader = { Authorization: `Bearer ${token}` };

    const handleAuthError = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // ── Fetch all applications ─────────────────────────────────────────────────
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(API, { headers: authHeader });
            if (res.status === 401 || res.status === 403) { handleAuthError(); return; }
            if (!res.ok) { setError("Failed to load applications."); return; }
            const data = await res.json();
            setApplications(Array.isArray(data) ? data : []);
        } catch {
            setError("Cannot reach server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    // ── Approve ────────────────────────────────────────────────────────────────
    const handleApprove = async (id) => {
        setActionId(id);
        try {
            const res = await fetch(`${API}/${id}/approve`, { method: "PATCH", headers: authHeader });
            if (res.status === 401 || res.status === 403) { handleAuthError(); return; }
            if (!res.ok) { const d = await res.json(); alert(d.message || "Failed."); return; }
            const updated = await res.json();
            setApplications((prev) => prev.map((a) => (a._id === id ? updated : a)));
        } catch { alert("Failed to approve application."); }
        finally { setActionId(null); }
    };

    // ── Reject ─────────────────────────────────────────────────────────────────
    const handleReject = async (id) => {
        setActionId(id);
        try {
            const res = await fetch(`${API}/${id}/reject`, { method: "PATCH", headers: authHeader });
            if (res.status === 401 || res.status === 403) { handleAuthError(); return; }
            if (!res.ok) { const d = await res.json(); alert(d.message || "Failed."); return; }
            const updated = await res.json();
            setApplications((prev) => prev.map((a) => (a._id === id ? updated : a)));
        } catch { alert("Failed to reject application."); }
        finally { setActionId(null); }
    };

    return (
        <div className="manage-page">
            <div className="manage-header">
                <div>
                    <h1>Manage Applications</h1>
                    <p className="manage-subtitle">Review and action all adoption requests</p>
                </div>
                <button className="admin-refresh-btn" onClick={fetchApplications}>↻ Refresh</button>
            </div>

            {error && <div className="admin-error-banner">{error}</div>}

            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading applications…</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="manage-empty">
                    <span className="manage-empty-icon">📋</span>
                    <h3>No applications yet</h3>
                    <p>Adoption applications will appear here.</p>
                </div>
            ) : (
                <div className="manage-grid">
                    {applications.map((app) => (
                        <ApplicationCard
                            key={app._id}
                            application={app}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            actionId={actionId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageApplications;
