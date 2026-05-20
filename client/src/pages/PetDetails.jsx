import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./PetDetails.css";

function PetDetails() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);

    const getPetDetails = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/pets/${id}`);
            const data = await response.json();

            if (data.success) {
                setPet(data.pet);
            }
        } catch (error) {
            console.log("Error fetching pet details:", error);
        }
    };

    useEffect(() => {
        getPetDetails();
    }, [id]);

    if (!pet) return <h2>Loading...</h2>;

    const totalPrice = pet.donationFee + pet.deliveryFee;

    return (
        <div className="pet-details-page">
            <div className="details-card">
                <img src={pet.image} alt={pet.name} className="details-image" />

                <div className="details-content">
                    <h1>{pet.name}</h1>
                    <p className="breed">{pet.breed}</p>

                    <div className="info-box">
                        <p><strong>Type:</strong> {pet.type}</p>
                        <p><strong>Gender:</strong> {pet.gender}</p>
                        <p><strong>Age:</strong> {pet.age} years old</p>
                        <p><strong>Location:</strong> {pet.location}</p>
                        <p><strong>Health:</strong> {pet.healthStatus}</p>
                        <p><strong>Vaccinated:</strong> {pet.vaccinated ? "Yes" : "No"}</p>
                        <p><strong>Good with kids:</strong> {pet.goodWithKids ? "Yes" : "No"}</p>
                        <p><strong>Good with pets:</strong> {pet.goodWithPets ? "Yes" : "No"}</p>
                        <p><strong>Status:</strong> {pet.status}</p>
                    </div>

                    <p className="description">{pet.description}</p>

                    <div className="medical-box">
                        <h3>Medical Notes</h3>
                        <p>{pet.medicalNotes || "No medical issues reported."}</p>
                    </div>

                    <div className="price-details">
                        <p>Donation Fee: {pet.donationFee} EGP</p>
                        <p>Delivery Fee: {pet.deliveryFee} EGP</p>
                        <h3>Total: {totalPrice} EGP</h3>
                        <span>
                            The adoption fee is symbolic and goes toward donations, food,
                            vaccination, and pet rescue support.
                        </span>
                    </div>

                    <Link
                        to={`/apply-adoption/${pet._id}`}
                        state={{ pet: pet }}
                        className="apply-btn"
                    >
                        Apply for Adoption
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PetDetails;