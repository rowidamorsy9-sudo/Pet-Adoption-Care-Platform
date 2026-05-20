const express = require("express");
const router = express.Router();

const {
    getAllPets,
    getSinglePet,
} = require("../controllers/petController");

router.get("/", getAllPets);
router.get("/:id", getSinglePet);

module.exports = router;