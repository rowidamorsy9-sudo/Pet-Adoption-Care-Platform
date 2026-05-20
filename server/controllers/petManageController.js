const Pet = require("../models/Pet");

// ─── POST /api/pet-manage  —  Add a new pet (admin only) 
const addPet = async (req, res) => {
    try {
        const {
            name, type, age, breed, gender,
            healthStatus, vaccinated, goodWithKids, goodWithPets, medicalNotes,
            description, location, image,
            donationFee, deliveryFee, status,
        } = req.body;

        // Basic required-field check
        if (!name || !type || !age || !breed || !gender || !location) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: name, type, age, breed, gender, location.",
            });
        }

        const pet = await Pet.create({
            name, type, age, breed, gender,
            healthStatus: healthStatus || "Healthy",
            vaccinated:   vaccinated   ?? false,
            goodWithKids: goodWithKids ?? true,
            goodWithPets: goodWithPets ?? true,
            medicalNotes: medicalNotes || "",
            description:  description  || "",
            location,
            image:        image        || "",
            donationFee:  donationFee  ?? 100,
            deliveryFee:  deliveryFee  ?? 50,
            status:       status       || "available",
            provider:     req.user._id,   // the logged-in admin
        });

        res.status(201).json({
            success: true,
            message: "Pet added successfully.",
            pet,
        });
    } catch (error) {
        console.error("addPet error:", error);
        res.status(500).json({ success: false, message: "Failed to add pet.", error: error.message });
    }
};

// ─── PUT /api/pet-manage/:id  —  Edit a pet (admin only) 
const editPet = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        const allowedFields = [
            "name", "type", "age", "breed", "gender",
            "healthStatus", "vaccinated", "goodWithKids", "goodWithPets", "medicalNotes",
            "description", "location", "image",
            "donationFee", "deliveryFee", "status",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                pet[field] = req.body[field];
            }
        });

        await pet.save();

        res.status(200).json({
            success: true,
            message: "Pet updated successfully.",
            pet,
        });
    } catch (error) {
        console.error("editPet error:", error);
        res.status(500).json({ success: false, message: "Failed to update pet.", error: error.message });
    }
};

// ─── DELETE /api/pet-manage/:id  —  Delete a pet (admin only) 
const deletePet = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findByIdAndDelete(id);
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found." });
        }

        res.status(200).json({
            success: true,
            message: `Pet "${pet.name}" deleted successfully.`,
        });
    } catch (error) {
        console.error("deletePet error:", error);
        res.status(500).json({ success: false, message: "Failed to delete pet.", error: error.message });
    }
};

// ─── GET /api/pet-manage  —  My pets (pets added by this admin) 
const getMyPets = async (req, res) => {
    try {
        const pets = await Pet.find({ provider: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pets.length,
            pets,
        });
    } catch (error) {
        console.error("getMyPets error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pets.", error: error.message });
    }
};

module.exports = { addPet, editPet, deletePet, getMyPets };