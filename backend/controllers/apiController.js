const { appPool } = require("../config/db");
const searchRecipes = require("../services/spoonacularService");
const { getUserPreferencesfromUserId } = require("../models/userModel");
/**
 * Recherche des recettes et les insère dans la base de données.
 *
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
const fetchAndStoreRecipes = async (req, res) => {
	const { query, number, userId } = req.body;

	const preferences = await getUserPreferencesfromUserId(userId);
	const intolerances = preferences.intolerances;
	const cuisines = preferences.cuisines;
	const diet = preferences.diets;
	const includeIngredients = [];
	const excludeIngredients = preferences.excludeIngredients;
	const maxReadyTime = preferences.maxReadyTime;
	const minServings = preferences.minServings;
	const maxServings = preferences.maxServings;

	try {
		// Appel de la logique métier
		const recipes = await searchRecipes({
			query,
			number,
			intolerances,
			cuisines,
			diet,
			includeIngredients,
			excludeIngredients,
			maxReadyTime,
			minServings,
			maxServings,
		});

		res.status(201).json({
			message: "Recettes récupérées et insérées avec succès.",
			data: recipes,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la recherche ou de l'insertion des recettes :",
			error.message
		);
		res.status(500).json({ message: "Une erreur est survenue.", error: error.message });
	}
};

module.exports = { fetchAndStoreRecipes };
