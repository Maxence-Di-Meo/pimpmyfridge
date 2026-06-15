const { Pool } = require("pg");

// Configuration de la base de données
const appPool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.APP_DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

// Fonction pour insérer les recettes dans la base
const insertRecipesToDB = async (recipes) => {
    const query = `
      INSERT INTO recipe (
        recipeid,
        name,
        instruction,
        nutrient,
        cost_level,
        tested,
        testeddate,
        mealtype,
        image,
        flavonoids,
        caloric_breakdown,
        weight_per_serving,
        properties,
        ingredient
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) ON CONFLICT (recipeid) DO NOTHING;
    `;

    try {
      for (const recipe of recipes) {
        const {
          id,
          title,
          ingredients,
          instructions,
          nutrition,
          pricePerServing,
          image
        } = recipe;

        const formattedIngredients = ingredients
        ? ingredients.map((ingredient) => ({
            name: ingredient.name, // Nom
            amount: ingredient.amount, // Quantité (déjà extrait dans test.js)
            unit: ingredient.unit, // Unité (déjà extrait dans test.js)
          }))
        : null;


        const formattedRecipe = [
          id, // recipeid
          title, // name
          instructions ? instructions.join(". ") : null, // instruction
          nutrition ? JSON.stringify(nutrition.nutrients) : null, // nutrient
          Math.ceil(pricePerServing / 100), // cost_level (approximation)
          false, // tested
          null, // testeddate
          null, // mealtype (non défini)
          image, // image
          nutrition ? JSON.stringify(nutrition.flavonoids) : null, // flavonoids
          nutrition ? JSON.stringify(nutrition.caloricBreakdown) : null, // caloric_breakdown
          nutrition ? JSON.stringify(nutrition.weightPerServing) : null, // weight_per_serving
          nutrition ? JSON.stringify(nutrition.properties) : null, // properties
          formattedIngredients ? JSON.stringify(formattedIngredients) : null // ingredient
        ];

        // Insertion dans la base
        await appPool.query(query, formattedRecipe);
      }
      console.log("Recettes insérées avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'insertion des recettes :", error.message);
    }
  };

module.exports = insertRecipesToDB;
