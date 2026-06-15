const { appPool } = require("../config/db");

/**
 * Récupère la recette la plus récente pour un utilisateur donné et génère une liste de courses
 * basée sur les 6 jours précédents la recette la plus récente.
 * 
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
const getRecentRecipeAndShoppingList = async (req, res) => {
    try {
        const { id: userId } = req.params;

        // Étape 1 : Récupérer la recette la plus récente pour l'utilisateur
        const recentRecipeResult = await appPool.query(
            `
            SELECT ur.datedue, r.ingredient
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
            SELECT r.ingredient
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

        // Étape 3 : Consolider les ingrédients
        const shoppingList = {};

        pastRecipesResult.rows.forEach((row) => {
            const recipeIngredients = row.ingredient;

            recipeIngredients.forEach((ingredient) => {
                const { name, unit, amount } = ingredient;

                // Vérifier si un ingrédient du même nom mais avec une unité différente existe
                if (shoppingList[name]) {
                    const existingUnits = shoppingList[name];

                    const matchingUnit = existingUnits.find((entry) => entry.unit === unit);

                    if (matchingUnit) {
                        // Additionner si l'unité est la même
                        matchingUnit.amount += amount;
                    } else {
                        // Ajouter une nouvelle entrée si l'unité est différente
                        existingUnits.push({ unit, amount });
                    }
                } else {
                    // Ajouter un nouvel ingrédient
                    shoppingList[name] = [{ unit, amount }];
                }
            });
        });

        // Étape 4 : Retourner la liste de courses
        res.status(200).json({
            message: "Liste de courses générée avec succès.",
            shoppingList,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error.message);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { getRecentRecipeAndShoppingList };
