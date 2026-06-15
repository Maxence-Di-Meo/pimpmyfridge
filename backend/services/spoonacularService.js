require('dotenv').config();
const axios = require('axios');
const insertRecipesToDB = require('./insertRecipesToDB');

/**
 * Recherche des recettes sur l'API Spoonacular et insère les informations détaillées dans la base de données.
 * 
 * @param {Object} options - Options pour la recherche de recettes.
 * @param {string} options.query - Mot clé pour rechercher des recettes.
 * @param {number} options.number - Nombre de recettes finales souhaitées.
 * @param {string[]} [options.intolerances] - Intolérances alimentaires (e.g., 'Dairy', 'Gluten').
 * @param {string[]} [options.cuisines] - Types de cuisines (e.g., 'French', 'Mexican').
 * @param {string[]} [options.diet] - Régime alimentaire (e.g., 'Vegetarian', 'Ketogenic').
 * @param {string[]} [options.includeIngredients] - Ingrédients à inclure dans les recettes.
 * @param {string[]} [options.excludeIngredients] - Ingrédients à exclure des recettes.
 * @param {number} [options.maxReadyTime] - Temps de préparation maximal en minutes.
 * @param {number} [options.minServings] - Nombre minimum de portions.
 * @param {number} [options.maxServings] - Nombre maximum de portions.
 * @param {string} [options.sort] - Critère de tri (e.g., 'calories', 'popularity').
 * @param {string} [options.sortDirection] - Direction du tri ('asc' ou 'desc').
 * @param {string} [options.type] - Type de recette (e.g., 'main course', 'dessert').
 */
const searchRecipes = async (options) => {
  let finalRecipes = [];
  let offset = 0;

  while (finalRecipes.length < options.number) {
    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      query: options.query,
      number: options.number - finalRecipes.length, // Récupérer uniquement ce qui manque
      offset,
      intolerances: options.intolerances ? options.intolerances.join(',') : undefined,
      cuisine: options.cuisines ? options.cuisines.join(',') : undefined,
      diet: options.diet ? options.diet.join(',') : undefined,
      includeIngredients: options.includeIngredients ? options.includeIngredients.join(',') : undefined,
      excludeIngredients: options.excludeIngredients ? options.excludeIngredients.join(',') : undefined,
      maxReadyTime: options.maxReadyTime,
      minServings: options.minServings,
      maxServings: options.maxServings,
      sort: options.sort,
      sortDirection: options.sortDirection,
      type: options.type || "main course", // Définit "main course" par défaut
    };

    try {
      // Premier appel pour chercher les recettes
      const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params });
      const recipes = response.data.results;

      // Récupérer les détails de chaque recette
      const detailedRecipes = await Promise.all(
        recipes.map(async (recipe) => {
          const details = await getRecipeDetails(recipe.id);
          return { ...recipe, ...details };
        })
      );

      // Filtrer les recettes incomplètes
      const validRecipes = detailedRecipes.filter(
        (recipe) =>
          recipe.nutrition &&
          Object.keys(recipe.nutrition).length > 0 &&
          recipe.ingredients &&
          recipe.ingredients.length > 0 &&
          recipe.instructions &&
          recipe.instructions.length > 0 &&
          recipe.pricePerServing > 0
      );

      finalRecipes = [...finalRecipes, ...validRecipes];
      offset += params.number;

      console.log(
        `${validRecipes.length} recettes valides ajoutées. Total actuel : ${finalRecipes.length}/${options.number}`
      );
    } catch (error) {
      console.error('Error searching recipes:', error.response?.data || error.message);
      throw error;
    }
  }

  // Insérer les recettes valides dans la base de données
  try {
    await insertRecipesToDB(finalRecipes);
    console.log('Toutes les recettes ont été insérées dans la base.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des recettes dans la base :', error.message);
  }

  return finalRecipes;
}
module.exports = searchRecipes;

/**
 * Récupère les détails d'une recette à partir de son ID.
 * 
 * @param {number} recipeId - ID de la recette.
 * @returns {Object} - Détails de la recette incluant les ingrédients, instructions, prix et nutrition.
 */
async function getRecipeDetails(recipeId) {
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeNutrition: true, // Inclut les informations nutritionnelles
        },
      });
  
      const data = response.data;
  
      // Formattage des données nutritionnelles pour un affichage clair
      const formattedNutrition = data.nutrition
        ? {
            nutrients: data.nutrition.nutrients,
            properties: data.nutrition.properties,
            flavonoids: data.nutrition.flavonoids,
            caloricBreakdown: data.nutrition.caloricBreakdown,
            weightPerServing: data.nutrition.weightPerServing,
          }
        : {};
  
      // Formattage des ingrédients
      const formattedIngredients = data.extendedIngredients
      ? data.extendedIngredients.map((ingredient) => {
          const metric = ingredient.measures?.metric || {};
          return {
            name: ingredient.name, // Nom de l'ingrédient
            amount: metric.amount || null, // Quantité (metrics)
            unit: metric.unitShort || null, // Unité (metrics)
            original: ingredient.original, // Texte original
          };
        })
      : [];
    

  
      return {
        ingredients: formattedIngredients, // Liste d'ingrédients formatée
        instructions: data.analyzedInstructions
          ? data.analyzedInstructions.flatMap((instruction) =>
              instruction.steps.map((step) => step.step)
            )
          : [],
        pricePerServing: data.pricePerServing || 0,
        nutrition: formattedNutrition,
      };
    } catch (error) {
      console.error(`Error fetching recipe details for ID ${recipeId}:`, error.message);
      return {
        ingredients: [],
        instructions: [],
        pricePerServing: 0,
        nutrition: {},
      };
    }
  }
  
// Exemple d'utilisation
// searchRecipes({
//   query: 'pasta',
//   number: 10,
//   intolerances: [],
//   cuisines: [],
//   diet: [],
//   includeIngredients: [],
//   excludeIngredients: ['peanut'],
//   maxReadyTime: 100,
//   minServings: 2,
//   maxServings: 6,
//   sort: 'calories',
//   sortDirection: 'asc',
// })
//   .then(() => {
//     console.log('Recherche terminée.');
//   })
//   .catch((error) => {
//     console.error('Erreur lors de la recherche des recettes:', error);
//   });
