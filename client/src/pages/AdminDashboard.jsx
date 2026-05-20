import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import ManageApplications from "./ManageApplications";
import "./AdminDashboard.css";

const API          = "http://localhost:4000/api/admin";
const USERS_API    = "http://localhost:4000/api/users";
const CONTACT_API  = "http://localhost:4000/api/admin/contact-messages";

function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const admin    = JSON.parse(localStorage.getItem("user") || "{}");
    const token    = localStorage.getItem("token");

    const [stats,    setStats]    = useState(null);
    const [users,    setUsers]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [deleting, setDeleting] = useState(null);

    // Edit user modal
    const [editUser,    setEditUser]    = useState(null);
    const [editForm,    setEditForm]    = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [editError,   setEditError]   = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    // Contact messages state
    const [messages,     setMessages]     = useState([]);
    const [msgsLoading,  setMsgsLoading]  = useState(false);
    const [msgsError,    setMsgsError]    = useState("");
    const [replyTarget,  setReplyTarget]  = useState(null); // message being replied to
    const [replyText,    setReplyText]    = useState("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [replyError,   setReplyError]   = useState("");
    const [replySuccess, setReplySuccess] = useState("");

    const path = location.pathname;
    const isApplicationsView = path === "/admin/applications";
    const isUsersView        = path === "/admin/users";
    const isMessagesView     = path === "/admin/messages";

    const authHeader = { Authorization: `Bearer ${token}` };

    // ── Fetch stats + users ────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [statsRes, usersRes] = await Promise.all([
                fetch(`${API}/dashboard`, { headers: authHeader }),
                fetch(`${USERS_API}/all`, { headers: authHeader }),
            ]);
            if (statsRes.status === 401 || statsRes.status === 403) {
                localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); return;
            }
            setStats(await statsRes.json());
            const ud = await usersRes.json();
            setUsers(Array.isArray(ud) ? ud : []);
        } catch { setError("Cannot reach server. Is the backend running?"); }
        finally  { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Fetch contact messages ─────────────────────────────────────────────────
    const fetchMessages = useCallback(async () => {
        setMsgsLoading(true);
        setMsgsError("");
        try {
            const res  = await fetch(CONTACT_API, { headers: authHeader });
            if (res.status === 401 || res.status === 403) { navigate("/login"); return; }
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch { setMsgsError("Cannot reach server."); }
        finally  { setMsgsLoading(false); }
    }, []);

    useEffect(() => { if (isMessagesView) fetchMessages(); }, [isMessagesView, fetchMessages]);

    // ── Delete user ────────────────────────────────────────────────────────────
    const handleDelete = async (userId, userEmail) => {
        if (!window.confirm(`Delete user "${userEmail}"? This cannot be undone.`)) return;
        setDeleting(userId);
        try {
            const res  = await fetch(`${API}/users/${userId}`, { method: "DELETE", headers: authHeader });
            const data = await res.json();
            if (!res.ok) { alert(data.message); return; }
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            if (stats) setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        } catch { alert("Failed to delete user."); }
        finally { setDeleting(null); }
    };

    // ── Open/save edit user ────────────────────────────────────────────────────
    const openEdit = (user) => {
        setEditUser(user);
        setEditForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role });
        setEditError(""); setEditSuccess("");
    };

    const handleEditSave = async () => {
        setEditLoading(true); setEditError(""); setEditSuccess("");
        try {
            const res  = await fetch(`${USERS_API}/${editUser._id}`, {
                method: "PUT",
                headers: { ...authHeader, "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (!res.ok) { setEditError(data.message || "Failed to update."); return; }
            setUsers((prev) => prev.map((u) => (u._id === editUser._id ? data.user : u)));
            setEditSuccess("User updated successfully!");
            setTimeout(() => setEditUser(null), 1000);
        } catch { setEditError("Cannot reach server."); }
        finally { setEditLoading(false); }
    };

    // ── Send admin reply ───────────────────────────────────────────────────────
    const handleReply = async () => {
        if (!replyText.trim()) { setReplyError("Reply cannot be empty."); return; }
        setReplyLoading(true); setReplyError(""); setReplySuccess("");
        try {
            const res  = await fetch(`${CONTACT_API}/${replyTarget._id}/reply`, {
                method: "PUT",
                headers: { ...authHeader, "Content-Type": "application/json" },
                body: JSON.stringify({ reply: replyText }),
            });
            const data = await res.json();
            if (!res.ok) { setReplyError(data.message || "Failed to send reply."); return; }
            // Update the message in-place
            setMessages((prev) => prev.map((m) => (m._id === replyTarget._id ? data.contactMessage : m)));
            setReplySuccess("Reply sent!");
            setTimeout(() => { setReplyTarget(null); setReplyText(""); setReplySuccess(""); }, 900);
        } catch { setReplyError("Cannot reach server."); }
        finally { setReplyLoading(false); }
    };

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem("token"); localStorage.removeItem("user");
        window.dispatchEvent(new Event("storageUpdated"));
        navigate("/login");
    };

    // ── Choose main content ────────────────────────────────────────────────────
    const renderMain = () => {
        if (isApplicationsView) return <ManageApplications />;
        if (isUsersView)        return <UsersView users={users} loading={loading} error={error} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} />;
        if (isMessagesView)     return <MessagesView messages={messages} loading={msgsLoading} error={msgsError} onRefresh={fetchMessages} onReply={(msg) => { setReplyTarget(msg); setReplyText(""); setReplyError(""); setReplySuccess(""); }} />;
        return <DashboardView stats={stats} loading={loading} error={error} onRefresh={fetchData} navigate={navigate} />;
    };

    return (
        <div className="admin-page">
            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                <div className="admin-brand"><span>🐾</span><span>PawHome</span></div>
                <nav className="admin-nav">
                    <span className={`admin-nav-item ${!isApplicationsView && !isUsersView && !isMessagesView ? "active" : ""}`} onClick={() => navigate("/admin")}>
                        📊 Dashboard
                    </span>
                    <Link to="/admin/my-pets" className="admin-nav-item">🐶 Pets</Link>
                    <span className={`admin-nav-item ${isApplicationsView ? "active" : ""}`} onClick={() => navigate("/admin/applications")}>
                        📋 Applications
                    </span>
                    <span className={`admin-nav-item ${isUsersView ? "active" : ""}`} onClick={() => navigate("/admin/users")}>
                        👥 Users
                    </span>
                    <span className={`admin-nav-item ${isMessagesView ? "active" : ""}`} onClick={() => navigate("/admin/messages")}>
                        💬 Messages
                    </span>
                </nav>
                <div className="admin-sidebar-footer">
                    <div className="admin-avatar">{admin.name?.charAt(0).toUpperCase()}</div>
                    <div className="admin-info">
                        <span className="admin-name">{admin.name}</span>
                        <span className="admin-role-badge">Admin</span>
                    </div>
                    <button className="admin-logout-btn" onClick={logout} title="Log out">⏻</button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="admin-main">
                {!isApplicationsView && !isUsersView && !isMessagesView && (
                    <header className="admin-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p className="admin-subtitle">Welcome back, {admin.name} 👋</p>
                        </div>
                        <button className="admin-refresh-btn" onClick={fetchData}>↻ Refresh</button>
                    </header>
                )}
                {renderMain()}
            </main>

            {/* ── Edit User Modal ── */}
            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
                        </div>
                        {editError   && <div className="modal-error">{editError}</div>}
                        {editSuccess && <div className="modal-success">{editSuccess}</div>}
                        <div className="modal-field"><label>Name</label><input value={editForm.name}  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                        <div className="modal-field"><label>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                        <div className="modal-field"><label>Phone</label><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="e.g. 01012345678" /></div>
                        <div className="modal-field">
                            <label>Role</label>
                            <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={() => setEditUser(null)}>Cancel</button>
                            <button className="modal-save-btn" onClick={handleEditSave} disabled={editLoading}>{editLoading ? "Saving…" : "Save Changes"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reply Modal ── */}
            {replyTarget && (
                <div className="modal-overlay" onClick={() => setReplyTarget(null)}>
                    <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reply to Message</h2>
                            <button className="modal-close" onClick={() => setReplyTarget(null)}>✕</button>
                        </div>

                        {/* Original message preview */}
                        <div className="reply-preview">
                            <p className="reply-preview-label">Original message from <strong>{replyTarget.name}</strong> ({replyTarget.email})</p>
                            <p className="reply-preview-text">{replyTarget.message}</p>
                        </div>

                        {replyError   && <div className="modal-error">{replyError}</div>}
                        {replySuccess && <div className="modal-success">{replySuccess}</div>}

                        <div className="modal-field">
                            <label>Your Reply</label>
                            <textarea rows={5} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply here…" style={{ resize: "vertical" }} />
                        </div>
                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={() => setReplyTarget(null)}>Cancel</button>
                            <button className="modal-save-btn" onClick={handleReply} disabled={replyLoading}>{replyLoading ? "Sending…" : "Send Reply"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Dashboard overview ────────────────────────────────────────────────────────
function DashboardView({ stats, loading, error, onRefresh, navigate }) {
    return (
        <>
            {error && <div className="admin-error-banner">{error}</div>}
            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Loading dashboard…</p></div>
            ) : (
                <>
                    <section className="admin-stats-grid">
                        <DashboardCard icon="👥" label="Total Users"           value={stats?.totalUsers}            color="blue"   />
                        <DashboardCard icon="🐾" label="Total Pets"            value={stats?.totalPets}             color="orange" />
                        <DashboardCard icon="📋" label="Total Applications"    value={stats?.totalApplications}     color="purple" />
                        <DashboardCard icon="⏳" label="Pending Applications"  value={stats?.pendingApplications}   color="yellow" />
                        <DashboardCard icon="✅" label="Approved Applications" value={stats?.approvedApplications}  color="green"  />
                        <DashboardCard icon="❌" label="Rejected Applications" value={stats?.rejectedApplications}  color="red"    />
                    </section>
                    <div className="admin-quick-actions">
                        <button className="admin-action-btn" onClick={() => navigate("/admin/applications")}>📋 Manage Applications</button>
                        <button className="admin-action-btn" onClick={() => navigate("/admin/users")}>👥 Manage Users</button>
                        <button className="admin-action-btn" onClick={() => navigate("/admin/messages")}>💬 Contact Messages</button>
                    </div>
                </>
            )}
        </>
    );
}

// ── Users page ────────────────────────────────────────────────────────────────
function UsersView({ users, loading, error, onEdit, onDelete, deleting }) {
    return (
        <div className="manage-page">
            <div className="manage-header">
                <div><h1>All Users</h1><p className="manage-subtitle">View and manage registered users</p></div>
            </div>
            {error && <div className="admin-error-banner">{error}</div>}
            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Loading users…</p></div>
            ) : (
                <section className="admin-section">
                    <h2>Registered Users <span className="admin-count">({users.length})</span></h2>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td><div className="user-cell"><div className="user-avatar-sm">{u.name.charAt(0).toUpperCase()}</div>{u.name}</div></td>
                                        <td>{u.email}</td>
                                        <td>{u.phone || <span className="na-text">—</span>}</td>
                                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="user-actions">
                                                <button className="edit-btn" onClick={() => onEdit(u)}>Edit</button>
                                                {u.role !== "admin" ? (
                                                    <button className="delete-btn" onClick={() => onDelete(u._id, u.email)} disabled={deleting === u._id}>{deleting === u._id ? "…" : "Delete"}</button>
                                                ) : (
                                                    <span className="protected-label">Protected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan="6" className="empty-row">No users found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

// ── Messages page ─────────────────────────────────────────────────────────────
function MessagesView({ messages, loading, error, onRefresh, onReply }) {
    return (
        <div className="manage-page">
            <div className="manage-header">
                <div><h1>Contact Messages</h1><p className="manage-subtitle">View and reply to user contact messages</p></div>
                <button className="admin-refresh-btn" onClick={onRefresh}>↻ Refresh</button>
            </div>
            {error && <div className="admin-error-banner">{error}</div>}
            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Loading messages…</p></div>
            ) : messages.length === 0 ? (
                <div className="manage-empty">
                    <span className="manage-empty-icon">💬</span>
                    <h3>No messages yet</h3>
                    <p>Contact form submissions will appear here.</p>
                </div>
            ) : (
                <section className="admin-section">
                    <h2>All Messages <span className="admin-count">({messages.length})</span></h2>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Status</th><th>Admin Reply</th><th>Date</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {messages.map((m) => (
                                    <tr key={m._id}>
                                        <td>{m.name}</td>
                                        <td>{m.email}</td>
                                        <td style={{ textTransform: "capitalize" }}>{m.subject}</td>
                                        <td className="msg-cell">{m.message}</td>
                                        <td>
                                            <span className={`role-badge ${m.status === "replied" ? "role-admin" : "role-user"}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="msg-cell">{m.adminReply || <span className="na-text">—</span>}</td>
                                        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="edit-btn" onClick={() => onReply(m)}>
                                                {m.adminReply ? "Edit Reply" : "Reply"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

export default AdminDashboard;
