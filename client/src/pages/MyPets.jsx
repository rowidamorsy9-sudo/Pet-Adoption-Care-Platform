import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./MyPets.css";

const API = "http://localhost:4000/api/pet-manage";

export default function MyPets() {
    const navigate = useNavigate();
    const token    = localStorage.getItem("token");
    const user     = JSON.parse(localStorage.getItem("user") || "null");

    const [pets,     setPets]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [deleting, setDeleting] = useState(null);

    // Guard — only admin
    if (!user || user.role !== "admin") {
        return (
            <div className="my-pets-page">
                <div className="mp-empty">
                    <p>⛔ Access denied. Admins only.</p>
                </div>
            </div>
        );
    }

    const authHeader = { Authorization: `Bearer ${token}` };

    const fetchPets = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res  = await fetch(API, { headers: authHeader });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }
            const data = await res.json();
            setPets(data.pets || []);
        } catch {
            setError("Cannot reach server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPets(); }, [fetchPets]);

    const handleDelete = async (petId, petName) => {
        if (!window.confirm(`Delete pet "${petName}"? This cannot be undone.`)) return;
        setDeleting(petId);
        try {
            const res  = await fetch(`${API}/${petId}`, {
                method:  "DELETE",
                headers: authHeader,
            });
            const data = await res.json();
            if (!res.ok) { alert(data.message); return; }
            setPets((prev) => prev.filter((p) => p._id !== petId));
        } catch {
            alert("Failed to delete pet.");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="my-pets-page">
            {/* Header */}
            <div className="mp-header">
                <div>
                    <button className="mp-back-btn" onClick={() => navigate("/admin")}>← Dashboard</button>
                    <h1>🐾 My Pets</h1>
                    <p className="mp-subtitle">Pets you have listed for adoption</p>
                </div>
                <Link to="/admin/add-pet" className="mp-add-btn">➕ Add New Pet</Link>
            </div>

            {error && <div className="mp-error">{error}</div>}

            {loading ? (
                <div className="mp-loading">
                    <div className="mp-spinner" />
                    <p>Loading pets…</p>
                </div>
            ) : pets.length === 0 ? (
                <div className="mp-empty">
                    <span className="mp-empty-icon">🐾</span>
                    <p>No pets listed yet.</p>
                    <Link to="/admin/add-pet" className="mp-add-btn">Add your first pet</Link>
                </div>
            ) : (
                <div className="mp-grid">
                    {pets.map((pet) => (
                        <div key={pet._id} className="mp-card">
                            {/* Image */}
                            <div className="mp-card-img">
                                {pet.image ? (
                                    <img src={pet.image} alt={pet.name} />
                                ) : (
                                    <span className="mp-card-img-placeholder">🐾</span>
                                )}
                                <span className={`mp-status-badge mp-status-${pet.status}`}>
                                    {pet.status}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="mp-card-body">
                                <h3 className="mp-card-name">{pet.name}</h3>
                                <p className="mp-card-meta">
                                    {pet.type} · {pet.breed} · {pet.age}yr · {pet.gender}
                                </p>
                                <p className="mp-card-location">📍 {pet.location}</p>
                                <div className="mp-card-fees">
                                    <span>💰 Adoption: {pet.donationFee} EGP</span>
                                    <span>🚚 Delivery: {pet.deliveryFee} EGP</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mp-card-actions">
                                <Link
                                    to={`/admin/edit-pet/${pet._id}`}
                                    className="mp-btn mp-btn-edit"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    className="mp-btn mp-btn-delete"
                                    onClick={() => handleDelete(pet._id, pet.name)}
                                    disabled={deleting === pet._id}
                                >
                                    {deleting === pet._id ? "…" : "🗑️ Delete"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}