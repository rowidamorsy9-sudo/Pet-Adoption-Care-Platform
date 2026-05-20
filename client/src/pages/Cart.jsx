import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const governorateFees = {
    Cairo: 50,
    Giza: 60,
    Alexandria: 90,
    Mansoura: 80,
    Tanta: 75,
    Aswan: 120,
    Luxor: 110,
    Ismailia: 85,
    Suez: 85,
};

function Cart() {
    const [cart, setCart] = useState([]);
    const [governorate, setGovernorate] = useState("");
    const [popup, setPopup] = useState({ show: false, message: "", type: "" });
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("token") || localStorage.getItem("user");

    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem("petCart")) || []);
    }, []);

    const showPopup = (message, type) => {
        setPopup({ show: true, message, type });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2500);
    };

    const removeFromCart = (id) => {
        const updated = cart.filter((pet) => pet._id !== id);
        setCart(updated);
        localStorage.setItem("petCart", JSON.stringify(updated));
        window.dispatchEvent(new Event("storageUpdated"));
        showPopup("Removed from adoption list", "success");
    };

    const deliveryFee = governorateFees[governorate] || 0;

    const donationTotal = cart.reduce((sum, pet) => {
        return sum + Number(pet.donationFee || 0);
    }, 0);

    const total = donationTotal + deliveryFee;

    const continueToAdoption = () => {
        if (!isLoggedIn) {
            showPopup("You must login first", "error");
            return;
        }

        if (cart.length === 0) {
            showPopup("Your adoption list is empty", "error");
            return;
        }

        if (!governorate) {
            showPopup("Please choose your governorate", "error");
            return;
        }

        navigate(`/apply-adoption/${cart[0]._id}`);
    };

    return (
        <div className="cart-page">
            {popup.show && <div className={`popup ${popup.type}`}>{popup.message}</div>}

            <h1>Your Adoption List</h1>

            {cart.length === 0 ? (
                <p>Your adoption list is empty</p>
            ) : (
                <>
                    {cart.map((pet) => (
                        <div className="cart-item" key={pet._id}>
                            <img src={pet.image} alt={pet.name} />

                            <div>
                                <h3>{pet.name}</h3>
                                <p>Breed: {pet.breed}</p>
                                <p>Donation Fee: {pet.donationFee || 0} EGP</p>
                                <p className="note">
                                    These symbolic fees support donations, food, vaccination, and rescue care.
                                </p>
                            </div>

                            <button onClick={() => removeFromCart(pet._id)}>Remove</button>
                        </div>
                    ))}

                    <div className="checkout-box">
                        <h2>Adoption Summary</h2>

                        <label>Choose Your Governorate</label>
                        <select value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
                            <option value="">Select governorate</option>
                            {Object.keys(governorateFees).map((gov) => (
                                <option key={gov} value={gov}>{gov}</option>
                            ))}
                        </select>

                        <p>Donation Total: {donationTotal} EGP</p>
                        <p>Delivery Fee: {deliveryFee} EGP</p>
                        <h3>Total Expected Fees: {total} EGP</h3>

                        {!isLoggedIn && (
                            <p className="login-warning">You must login first before sending adoption request.</p>
                        )}

                        <button onClick={continueToAdoption}>Continue to Adoption Request</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;