import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PetCard.css";

function PetCard({ pet }) {
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
    });

    const showPopup = (message, type) => {
        setPopup({ show: true, message, type });

        setTimeout(() => {
            setPopup({ show: false, message: "", type: "" });
        }, 2500);
    };

    const updateNavbarCounts = () => {
        window.dispatchEvent(new Event("storageUpdated"));
    };

    const addToCart = () => {
        const cart = JSON.parse(localStorage.getItem("petCart")) || [];
        const exists = cart.find((item) => item._id === pet._id);

        if (exists) {
            showPopup("This pet is already in cart", "error");
            return;
        }

        localStorage.setItem("petCart", JSON.stringify([...cart, pet]));
        updateNavbarCounts();
        showPopup("Added to cart successfully 🛒", "success");
    };

    const addToWishlist = () => {
        const wishlist = JSON.parse(localStorage.getItem("petWishlist")) || [];
        const exists = wishlist.find((item) => item._id === pet._id);

        if (exists) {
            showPopup("This pet is already in wishlist", "error");
            return;
        }

        localStorage.setItem("petWishlist", JSON.stringify([...wishlist, pet]));
        updateNavbarCounts();
        showPopup("Added to wishlist ❤️", "success");
    };

    return (
        <>
            {popup.show && (
                <div className={`popup ${popup.type}`}>
                    {popup.message}
                </div>
            )}

            <div className="pet-card">
                <div className="pet-image-box">
                    <img src={pet.image} alt={pet.name} className="pet-image" />

                    <button onClick={addToWishlist} className="heart-btn">
                        ♥
                    </button>

                    <div className="pet-tags">
                        <span className="tag pink">{pet.type}</span>
                        <span className="tag purple">{pet.gender}</span>
                    </div>
                </div>

                <div className="pet-info">
                    <h3>{pet.name}</h3>
                    <p className="breed">{pet.breed}</p>

                    <p className="details">📅 {pet.age} years old</p>
                    <p className="details">📍 {pet.location}</p>
                    <p className="details">
                        💉 {pet.vaccinated ? "Vaccinated" : "Not vaccinated"}
                    </p>

                    <div className="price-box">
                        <p>Donation: {pet.donationFee || 0} EGP</p>
                    </div>

                    <p className="donation-note">
                        These fees are symbolic and help support pet care donations.
                    </p>

                    <div className="card-actions">
                        <Link to={`/pets/${pet._id}`} className="details-btn">
                            Details
                        </Link>

                        <button onClick={addToCart} className="adopt-btn">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PetCard;