const express = require("express");
const { getShoppingListByUser } = require("../controllers/listingredientsController");

const router = express.Router();

// Route pour récupérer la liste des ingrédients pour un utilisateur
router.get("/:userid", getShoppingListByUser);

module.exports = router;
