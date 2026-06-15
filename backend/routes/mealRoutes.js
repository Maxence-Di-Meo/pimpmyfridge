const express = require("express");
const {
	getRecipes,
	rejectRecipe,
	confirmSingleRecipe,
	confirmAllRecipes,
	getNextWeekRecipes,
	generateNextWeekRecipes,
	clearCache,
} = require("../controllers/mealController");

const router = express.Router();

router.get("/", getRecipes);
router.post("/reject", rejectRecipe);
router.post("/confirm-single", confirmSingleRecipe);
router.post("/confirm", confirmAllRecipes);

router.get("/next-week", getNextWeekRecipes); 
router.post("/next-week", generateNextWeekRecipes); 

router.delete("/clear-cache", clearCache);

module.exports = router;
