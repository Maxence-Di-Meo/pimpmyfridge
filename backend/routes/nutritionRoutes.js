const express = require("express");
const {getRecentRecipeAndNutritionSummary } = require("../controllers/nutritionController");
const router = express.Router();

router.get("/:id", getRecentRecipeAndNutritionSummary);

module.exports = router;
