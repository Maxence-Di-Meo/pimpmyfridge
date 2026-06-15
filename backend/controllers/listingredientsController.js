const { appPool } = require("../config/db");

/**
 * Récupère la liste des ingrédients pour un utilisateur donné.
 *
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
const getShoppingListByUser = async (req, res) => {
    try {
        const { userid } = req.params;

        // Vérification de l'entrée
        if (!userid) {
            return res.status(400).json({ message: "L'ID utilisateur est requis." });
        }

        // Récupérer les données depuis la table shoppinglist
        const query = `
            SELECT *
            FROM shoppinglist
            WHERE userid = $1
        `;
        const result = await appPool.query(query, [userid]);

        // Vérification des résultats
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Aucune liste trouvée pour cet utilisateur." });
        }

        res.status(200).json({
            message: "Liste d'ingrédients récupérée avec succès.",
            shoppingLists: result.rows,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des listes d'ingrédients :", error.message);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { getShoppingListByUser };
