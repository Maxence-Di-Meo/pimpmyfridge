const { appPool } = require("../config/db");

/**
 * Récupère une recette par son ID.
 * @param {number} id - L'ID de la recette.
 * @returns {Promise<Object>} - La recette correspondante.
 */
const getRecipeById = async id => {
	const result = await appPool.query("SELECT * FROM Recipe WHERE recipeid = $1", [id]);
	return result.rows[0];
};

/**
 * Récupère toutes les recettes.
 * @returns {Promise<Array>} - La liste de toutes les recettes.
 */
const getAllRecipes = async () => {
	const result = await appPool.query("SELECT * FROM recipe");
	return result.rows;
};

module.exports = { getRecipeById, getAllRecipes };
