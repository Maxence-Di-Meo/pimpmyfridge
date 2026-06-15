const express = require("express");
const { getRecipeById, getAllRecipes } = require("../controllers/recipeController");
const router = express.Router();

router.get("/:id", getRecipeById);
router.get("/", getAllRecipes);

module.exports = router;
