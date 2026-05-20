const express = require("express");
const router = express.Router();

const {
    submitApplication,
    getMyApplications,
} = require("../controllers/applicationController");

router.post("/submit", submitApplication);
router.get("/my-applications", getMyApplications);

module.exports = router;