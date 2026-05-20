const Application = require("../models/Application");
const Pet = require("../models/Pet");

// ─── GET /api/admin/applications ─────────────────────────────────────────────
const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        console.error("getAllApplications error:", error);
        res.status(500).json({ message: "Failed to fetch applications." });
    }
};

// ─── PATCH /api/admin/applications/:id/approve ────────────────────────────────
// Approve: pet stays "adopted" (remains hidden from available list)
const approveApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findByIdAndUpdate(
            id,
            { status: "approved" },
            { new: true }
        );
        if (!application) return res.status(404).json({ message: "Application not found." });

        // Pet stays "adopted" — no change needed, already hidden on submit
        res.status(200).json(application);
    } catch (error) {
        console.error("approveApplication error:", error);
        res.status(500).json({ message: "Failed to approve application." });
    }
};

// ─── PATCH /api/admin/applications/:id/reject ─────────────────────────────────
// Reject: restore pet to "available" so it reappears in the list
const rejectApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findByIdAndUpdate(
            id,
            { status: "rejected" },
            { new: true }
        );
        if (!application) return res.status(404).json({ message: "Application not found." });

        // Restore the pet to available when request is rejected
        if (application.petId) {
            await Pet.findByIdAndUpdate(application.petId, { status: "available" });
        }

        res.status(200).json(application);
    } catch (error) {
        console.error("rejectApplication error:", error);
        res.status(500).json({ message: "Failed to reject application." });
    }
};

module.exports = { getAllApplications, approveApplication, rejectApplication };
