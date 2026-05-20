const express = require("express");
const router  = express.Router();

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { addPet, editPet, deletePet, getMyPets } = require("../controllers/petManageController");

// Every route here requires a valid JWT AND role === "admin"
router.use(verifyToken, requireAdmin);

// GET    /api/pet-manage          — list pets added by this admin
router.get("/",        getMyPets);

// POST   /api/pet-manage          — add a new pet
router.post("/",       addPet);

// PUT    /api/pet-manage/:id      — edit an existing pet
router.put("/:id",     editPet);

// DELETE /api/pet-manage/:id      — delete a pet
router.delete("/:id",  deletePet);

module.exports = router;