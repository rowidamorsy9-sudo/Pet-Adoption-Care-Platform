import React, { useEffect, useState } from "react";
import PetCard from "../components/PetCard";
import "./Pets.css";

function Pets() {
    const [pets, setPets] = useState([]);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [gender, setGender] = useState("");

    const getPets = async () => {
        try {
            let url = `http://localhost:4000/api/pets?search=${search}&type=${type}&gender=${gender}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPets(data.pets);
            }
        } catch (error) {
            console.log("Error fetching pets:", error);
        }
    };

    useEffect(() => {
        getPets();
    }, [search, type, gender]);

    return (
        <div className="pets-page">
            <div className="pets-header">
                <h1>All Available Pets</h1>
                <p>{pets.length} pets waiting for a loving home</p>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by name, breed or location"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                </select>

                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            <div className="pets-grid">
                {pets.map((pet) => (
                    <PetCard key={pet._id} pet={pet} />
                ))}
            </div>
        </div>
    );
}

export default Pets;