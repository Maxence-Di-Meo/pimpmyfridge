const { getRecipeById, getAllRecipes } = require("../models/recipeModel");

const getRecipeByIdController = async (req, res) => {
	try {
		const { id } = req.params;
		const recipe = await getRecipeById(id);

		if (!recipe) {
			return res.status(404).json({ message: "Recette non trouvée." });
		}

		res.status(200).json(recipe);
	} catch (error) {
		console.error("Erreur lors de la récupération de la recette :", error.message);
		res.status(500).json({ message: "Erreur interne du serveur." });
	}
};

const getAllRecipesController = async (req, res) => {
	try {
		const recipes = await getAllRecipes();
		res.status(200).json({ message: "Recettes récupérées avec succès.", data: recipes });
	} catch (error) {
		console.error("Erreur lors de la récupération des recettes :", error.message);
		res.status(500).json({ message: "Une erreur est survenue.", error: error.message });
	}
};

module.exports = { getRecipeById: getRecipeByIdController, getAllRecipes: getAllRecipesController };
