const { appPool } = require("../config/db");

/**
 * Récupère les recettes les plus récentes pour un utilisateur donné et génère un résumé nutritionnel
 * basé sur les 6 jours précédents la recette la plus récente.
 *
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
const getRecentRecipeAndNutritionSummary = async (req, res) => {
    try {
        const { id: userId } = req.params;

        // Étape 1 : Récupérer la recette la plus récente pour l'utilisateur
        const recentRecipeResult = await appPool.query(
            `
            SELECT ur.datedue, r.name
            FROM "userRecipe" ur
            JOIN recipe r ON ur.recipeid = r.recipeid
            WHERE ur.userid = $1
            ORDER BY ur.datedue DESC
            LIMIT 1
            `,
            [userId]
        );

        if (recentRecipeResult.rows.length === 0) {
            return res.status(404).json({ message: "Aucune recette trouvée pour cet utilisateur." });
        }

        const { datedue: recentDate } = recentRecipeResult.rows[0];

        // Étape 2 : Récupérer les recettes des 6 jours précédents
        const pastRecipesResult = await appPool.query(
            `
            SELECT r.name, r.properties, r.caloric_breakdown, r.flavonoids, r.nutrient
            FROM "userRecipe" ur
            JOIN recipe r ON ur.recipeid = r.recipeid
            WHERE ur.userid = $1
              AND ur.datedue >= $2
              AND ur.datedue <= $3
            `,
            [userId, new Date(new Date(recentDate).setDate(new Date(recentDate).getDate() - 6)), recentDate]
        );

        if (pastRecipesResult.rows.length === 0) {
            return res.status(404).json({ message: "Aucune recette pour les 6 jours précédents." });
        }

        // Étape 3 : Construire le résumé nutritionnel par recette
        const nutritionSummary = pastRecipesResult.rows.map((row) => {
            const { name, properties, caloric_breakdown, flavonoids, nutrient } = row;

            return {
                name, // Nom de la recette
                nutritionSummary: {
                    properties: properties || [],
                    caloric_breakdown: caloric_breakdown || { percentFat: 0, percentCarbs: 0, percentProtein: 0 },
                    flavonoids: flavonoids || [],
                    nutrient: nutrient || [],
                },
            };
        });

        // Étape 4 : Retourner le résumé nutritionnel
        res.status(200).json({
            message: "Résumé nutritionnel généré avec succès.",
            recipes: nutritionSummary,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error.message);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { getRecentRecipeAndNutritionSummary };
