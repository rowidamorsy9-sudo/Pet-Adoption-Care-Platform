const Pet = require("../models/Pet");

// Get all pets + search/filter
const getAllPets = async (req, res) => {
    try {
        const { search, type, gender } = req.query;

        let filter = { status: "available" };

        if (type) {
            filter.type = type;
        }

        if (gender) {
            filter.gender = gender;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { breed: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        const pets = await Pet.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pets.length,
            pets,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error getting pets",
            error: error.message,
        });
    }
};

// Get single pet by id
const getSinglePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        res.status(200).json({
            success: true,
            pet,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error getting pet details",
            error: error.message,
        });
    }
};

module.exports = {
    getAllPets,
    getSinglePet,
};