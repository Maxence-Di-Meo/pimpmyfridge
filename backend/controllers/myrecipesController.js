const { appPool } = require("../config/db");
const { getRecipeById } = require("../models/recipeModel");

/**
 * Récupère toutes les recettes de la table "userRecipe" appartenant à un utilisateur donné.
 *
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
const getMyRecipesController = async (req, res) => {
    try {
        const { id: userId } = req.params;

        // Étape 1 : Récupérer toutes les recettes de l'utilisateur dans "userRecipe"
        const userRecipesResult = await appPool.query(
            `
            SELECT ur.recipeid
            FROM "userRecipe" ur
            WHERE ur.userid = $1
            `,
            [userId]
        );

        if (userRecipesResult.rows.length === 0) {
            return res.status(404).json({ message: "Aucune recette trouvée pour cet utilisateur." });
        }

        const recipeIds = userRecipesResult.rows.map((row) => row.recipeid);

        // Étape 2 : Récupérer les informations de chaque recette à partir du modèle
        const recipes = await Promise.all(
            recipeIds.map(async (recipeId) => {
                const recipe = await getRecipeById(recipeId);
                return recipe;
            })
        );

        // Étape 3 : Retourner les recettes
        res.status(200).json({
            message: "Recettes récupérées avec succès.",
            data: recipes,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des recettes :", error.message);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { getMyRecipesController };
