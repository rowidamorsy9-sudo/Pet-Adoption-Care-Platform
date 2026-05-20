import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PetForm.css";

const API = "http://localhost:4000/api/pet-manage";

const INITIAL_FORM = {
    name:         "",
    type:         "",
    breed:        "",
    age:          "",
    gender:       "",
    location:     "",
    image:        "",
    description:  "",
    healthStatus: "Healthy",
    vaccinated:   false,
    goodWithKids: true,
    goodWithPets: true,
    medicalNotes: "",
    donationFee:  100,
    deliveryFee:  50,
    status:       "available",
};

export default function AddPet() {
    const navigate = useNavigate();
    const token    = localStorage.getItem("token");
    const user     = JSON.parse(localStorage.getItem("user") || "null");

    const [form,    setForm]    = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");
    const [success, setSuccess] = useState("");

    // Guard — only admin
    if (!user || user.role !== "admin") {
        return (
            <div className="pet-form-page">
                <div className="pet-form-card">
                    <p className="pf-error">⛔ Access denied. Admins only.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res  = await fetch(API, {
                method:  "POST",
                headers: {
                    "Content-Type":  "application/json",
                    Authorization:   `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    age:         Number(form.age),
                    donationFee: Number(form.donationFee),
                    deliveryFee: Number(form.deliveryFee),
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to add pet.");
                return;
            }

            setSuccess(`✅ Pet "${data.pet.name}" added successfully!`);
            setForm(INITIAL_FORM);
        } catch {
            setError("Cannot reach server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pet-form-page">
            <div className="pet-form-card">
                {/* Header */}
                <div className="pf-header">
                    <button className="pf-back-btn" onClick={() => navigate("/admin")}>← Back</button>
                    <h1>🐾 Add New Pet</h1>
                    <p className="pf-subtitle">Fill in the details below to list a new pet for adoption.</p>
                </div>

                {error   && <div className="pf-alert pf-alert-error">{error}</div>}
                {success && <div className="pf-alert pf-alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="pf-form">
                    {/* ── Basic Info ── */}
                    <fieldset className="pf-section">
                        <legend>Basic Information</legend>
                        <div className="pf-grid">
                            <div className="pf-field">
                                <label>Pet Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Max" required />
                            </div>
                            <div className="pf-field">
                                <label>Type *</label>
                                <select name="type" value={form.type} onChange={handleChange} required>
                                    <option value="">Select type…</option>
                                    <option>Dog</option>
                                    <option>Cat</option>
                                    <option>Bird</option>
                                    <option>Rabbit</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="pf-field">
                                <label>Breed *</label>
                                <input name="breed" value={form.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" required />
                            </div>
                            <div className="pf-field">
                                <label>Age (years) *</label>
                                <input name="age" type="number" min="0" value={form.age} onChange={handleChange} placeholder="e.g. 2" required />
                            </div>
                            <div className="pf-field">
                                <label>Gender *</label>
                                <select name="gender" value={form.gender} onChange={handleChange} required>
                                    <option value="">Select gender…</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div className="pf-field">
                                <label>Location *</label>
                                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Cairo, Egypt" required />
                            </div>
                        </div>
                        <div className="pf-field pf-full">
                            <label>Image URL</label>
                            <input name="image" value={form.image} onChange={handleChange} placeholder="https://…" />
                        </div>
                        <div className="pf-field pf-full">
                            <label>Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Tell us about this pet…" />
                        </div>
                    </fieldset>

                    {/* ── Health ── */}
                    <fieldset className="pf-section">
                        <legend>Health &amp; Behaviour</legend>
                        <div className="pf-grid">
                            <div className="pf-field">
                                <label>Health Status</label>
                                <select name="healthStatus" value={form.healthStatus} onChange={handleChange}>
                                    <option>Healthy</option>
                                    <option>Minor Issues</option>
                                    <option>Under Treatment</option>
                                    <option>Needs Special Care</option>
                                </select>
                            </div>
                        </div>
                        <div className="pf-checkboxes">
                            <label className="pf-check">
                                <input type="checkbox" name="vaccinated"   checked={form.vaccinated}   onChange={handleChange} />
                                Vaccinated
                            </label>
                            <label className="pf-check">
                                <input type="checkbox" name="goodWithKids" checked={form.goodWithKids} onChange={handleChange} />
                                Good with kids
                            </label>
                            <label className="pf-check">
                                <input type="checkbox" name="goodWithPets" checked={form.goodWithPets} onChange={handleChange} />
                                Good with other pets
                            </label>
                        </div>
                        <div className="pf-field pf-full">
                            <label>Medical Notes</label>
                            <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} rows={2} placeholder="Any medical history or notes…" />
                        </div>
                    </fieldset>

                    {/* ── Fees & Status ── */}
                    <fieldset className="pf-section">
                        <legend>Fees &amp; Status</legend>
                        <div className="pf-grid">
                            <div className="pf-field">
                                <label>Donation Fee (EGP)</label>
                                <input name="donationFee" type="number" min="0" value={form.donationFee} onChange={handleChange} />
                            </div>
                            <div className="pf-field">
                                <label>Delivery Fee (EGP)</label>
                                <input name="deliveryFee" type="number" min="0" value={form.deliveryFee} onChange={handleChange} />
                            </div>
                            <div className="pf-field">
                                <label>Status</label>
                                <select name="status" value={form.status} onChange={handleChange}>
                                    <option value="available">Available</option>
                                    <option value="adopted">Adopted</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* ── Actions ── */}
                    <div className="pf-actions">
                        <button type="button" className="pf-btn pf-btn-secondary" onClick={() => navigate("/admin/my-pets")}>
                            Cancel
                        </button>
                        <button type="submit" className="pf-btn pf-btn-primary" disabled={loading}>
                            {loading ? "Adding…" : "➕ Add Pet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
