import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./ApplyAdoption.css";

function ApplyAdoption() {
    const navigate = useNavigate();
    const { petId } = useParams();
    const location = useLocation();

    const petFromState = location.state?.pet;

    const [pet, setPet] = useState(petFromState || null);
    const [petLoading, setPetLoading] = useState(!petFromState);

    const [formData, setFormData] = useState({
        petId: petFromState?._id || petId || "",
        petName: petFromState?.name || "",
        petImage: petFromState?.image || "",
        userName: "",
        userEmail: "",
        phone: "",
        address: "",
        reason: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const getPetDetails = async () => {
        try {
            setPetLoading(true);
            setMessage("");

            const response = await fetch(`http://localhost:4000/api/pets/${petId}`);
            const data = await response.json();

            const selectedPet = data.pet || data.data || null;

            if (data.success && selectedPet) {
                setPet(selectedPet);

                setFormData((prevData) => ({
                    ...prevData,
                    petId: selectedPet._id || petId,
                    petName: selectedPet.name || "",
                    petImage: selectedPet.image || "",
                }));
            } else {
                setMessage("Could not load pet details.");
            }
        } catch (error) {
            console.log("Error fetching pet details:", error);
            setMessage("Could not load pet details.");
        }

        setPetLoading(false);
    };

    useEffect(() => {
        if (petFromState) {
            setPet(petFromState);
            setFormData((prevData) => ({
                ...prevData,
                petId: petFromState._id || petId || "",
                petName: petFromState.name || "",
                petImage: petFromState.image || "",
            }));
            setPetLoading(false);
        } else if (petId && petId !== "undefined") {
            getPetDetails();
        } else {
            setPetLoading(false);
            setMessage("No pet selected.");
        }
    }, [petId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:4000/api/applications/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Application submitted successfully. Status: pending");

                setTimeout(() => {
                    navigate("/my-applications");
                }, 1200);
            } else {
                setMessage(data.message || "Something went wrong");
            }
        } catch (error) {
            setMessage("Cannot connect to server");
        }

        setLoading(false);
    };

    return (
        <div className="apply-adoption-page">
            <div className="apply-layout">
                <div className="apply-form-panel">
                    <h1>Apply for Adoption</h1>

                    <p className="apply-subtitle">
                        Fill in your details to send an adoption request.
                    </p>

                    {message && <p className="apply-message">{message}</p>}

                    <form onSubmit={handleSubmit} className="apply-form">
                        <div className="apply-form-group">
                            <label>Your Name</label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="apply-form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="userEmail"
                                value={formData.userEmail}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="apply-form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="apply-form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your address"
                                required
                            />
                        </div>

                        <div className="apply-form-group">
                            <label>Why do you want to adopt this pet?</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Write your reason here"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="apply-submit-btn"
                            disabled={loading || !pet}
                        >
                            {loading ? "Submitting..." : "Apply Now"}
                        </button>
                    </form>
                </div>

                <div className="selected-pet-panel">
                    {petLoading ? (
                        <div className="pet-loading-box">
                            <p>Loading pet details...</p>
                        </div>
                    ) : pet ? (
                        <div className="selected-pet-card">
                            <img
                                src={pet.image}
                                alt={pet.name}
                                className="selected-pet-image"
                            />

                            <div className="selected-pet-info">
                                <h2>{pet.name}</h2>

                                <p className="apply-pet-breed">{pet.breed}</p>

                                <div className="apply-pet-tags">
                                    <span>{pet.type}</span>
                                    <span>{pet.gender}</span>
                                </div>

                                <div className="apply-pet-info-list">
                                    <p>
                                        <strong>Age:</strong> {pet.age} years old
                                    </p>

                                    <p>
                                        <strong>Location:</strong> {pet.location}
                                    </p>

                                    <p>
                                        <strong>Health:</strong> {pet.healthStatus}
                                    </p>

                                    <p>
                                        <strong>Vaccinated:</strong>{" "}
                                        {pet.vaccinated ? "Yes" : "No"}
                                    </p>

                                    <p>
                                        <strong>Good with kids:</strong>{" "}
                                        {pet.goodWithKids ? "Yes" : "No"}
                                    </p>

                                    <p>
                                        <strong>Good with pets:</strong>{" "}
                                        {pet.goodWithPets ? "Yes" : "No"}
                                    </p>
                                </div>

                                <div className="apply-pet-description-box">
                                    <h3>About this pet</h3>
                                    <p>{pet.description}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="pet-loading-box">
                            <p>Pet details not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ApplyAdoption;