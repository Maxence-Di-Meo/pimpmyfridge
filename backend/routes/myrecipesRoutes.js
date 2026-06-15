const express = require("express");
const { getMyRecipesController } = require("../controllers/myrecipesController");
const router = express.Router();

// Route pour récupérer les recettes d'un utilisateur donné
router.get("/:id", getMyRecipesController);

module.exports = router;
