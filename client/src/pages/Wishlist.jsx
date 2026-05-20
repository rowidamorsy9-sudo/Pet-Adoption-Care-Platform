import React, { useEffect, useState } from "react";
import PetCard from "../components/PetCard";
import "./Wishlist.css";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
    });

    useEffect(() => {
        setWishlist(
            JSON.parse(localStorage.getItem("petWishlist")) || []
        );
    }, []);

    const showPopup = (message, type) => {
        setPopup({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setPopup({
                show: false,
                message: "",
                type: "",
            });
        }, 2500);
    };

    const removeFromWishlist = (id) => {
        const updatedWishlist = wishlist.filter(
            (pet) => pet._id !== id
        );

        setWishlist(updatedWishlist);

        localStorage.setItem(
            "petWishlist",
            JSON.stringify(updatedWishlist)
        );

        window.dispatchEvent(new Event("storageUpdated"));

        showPopup("Removed from wishlist 💔", "success");
    };

    return (
        <div className="wishlist-page">
            {popup.show && (
                <div className={`popup ${popup.type}`}>
                    {popup.message}
                </div>
            )}

            <h1>Your Wishlist</h1>

            {wishlist.length === 0 ? (
                <p>No pets in wishlist</p>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map((pet) => (
                        <div key={pet._id} className="wishlist-item">
                            <PetCard pet={pet} />

                            <button
                                className="remove-btn"
                                onClick={() =>
                                    removeFromWishlist(pet._id)
                                }
                            >
                                Remove from Wishlist
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Wishlist;