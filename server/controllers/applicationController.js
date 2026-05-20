const Application = require("../models/Application");
const Pet = require("../models/Pet");

// POST /api/applications/submit
const submitApplication = async (req, res) => {
    try {
        const { petId, petName, userName, userEmail, phone, address, reason } = req.body;

        if (!userName || !userEmail || !phone || !address || !reason) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newApplication = new Application({
            petId: petId || null,
            petName: petName || "Selected Pet",
            userName,
            userEmail,
            phone,
            address,
            reason,
            status: "pending",
        });

        const savedApplication = await newApplication.save();

        // ── Hide the pet from available list immediately when a request is submitted
        if (petId) {
            await Pet.findByIdAndUpdate(petId, { status: "adopted" });
        }

        res.status(201).json({
            message: "Adoption application submitted successfully",
            application: savedApplication,
        });
    } catch (error) {
        res.status(500).json({ message: "Error submitting adoption application", error: error.message });
    }
};

// GET /api/applications
const getMyApplications = async (req, res) => {
    try {
        const { email } = req.query;
        const applications = email
            ? await Application.find({ userEmail: email }).sort({ createdAt: -1 })
            : await Application.find().sort({ createdAt: -1 });

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching applications", error: error.message });
    }
};

module.exports = { submitApplication, getMyApplications };
