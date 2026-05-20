const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, required: true },
        age: { type: Number, required: true },
        breed: { type: String, required: true },
        gender: { type: String, required: true },

        healthStatus: { type: String, default: "Healthy" },
        vaccinated: { type: Boolean, default: false },
        goodWithKids: { type: Boolean, default: true },
        goodWithPets: { type: Boolean, default: true },
        medicalNotes: { type: String, default: "" },

        description: { type: String, default: "" },
        location: { type: String, required: true },
        image: { type: String, default: "" },

        donationFee: { type: Number, default: 100 },
        deliveryFee: { type: Number, default: 50 },

        status: {
            type: String,
            enum: ["available", "adopted"],
            default: "available",
        },

        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);