const axios = require("axios");
const { backendBaseUrl, ollamaBaseUrl } = require("../config/serviceUrls");

// Fonction pour nettoyer et analyser les données nutritionnelles
async function analyzeNutritionData(nutritionData) {
  const apiUrl = `${ollamaBaseUrl}/api/generate`;
  //const apiUrl = "http://localhost:11434/api/generate";

  const prompt = `
        You are an AI tasked with analyzing detailed nutritional data for a set of recipes. 
    Given the following input data:

    ${JSON.stringify(nutritionData, null, 2)}

    Tasks:
    1. For each recipe, analyze the nutritional profile, including:
       - Macronutrients: Fat, Carbs, Protein (percentages and total amounts).
       - Micronutrients: Vitamins (e.g., Vitamin C, Vitamin A, Folate) and minerals (e.g., Iron, Calcium, Zinc).
       - Properties: Glycemic Index, Glycemic Load, and Inflammatory Score.
    2. Assess the nutritional quality of each recipe by comparing the values to standard dietary recommendations:
       - Highlight excessive or insufficient levels of any nutrient or property.
       - Mark recipes with balanced nutrient profiles as "well-balanced."
    3. Summarize the overall nutritional trends for all recipes over the 6-day period:
       - Identify recurring strengths (e.g., sufficient fiber, high levels of Vitamin C).
       - Highlight areas for improvement (e.g., excessive saturated fat, low iron levels).
    4. Calculate a "foodscore" between 0 and 100 for the entire set of meals:
       - A score of 100 indicates optimal nutrition and balance across all meals.
       - Consider overall macronutrient distribution, micronutrient sufficiency, and any recurring excesses or deficiencies.
    5. Provide personalized advice for the user, including:
       - Recommendations for improvement based on the observed trends (e.g., "Add more iron-rich foods like spinach or lentils").
       - Positive reinforcement if the meals align with dietary goals (e.g., "Great job maintaining balanced vitamin and mineral intake!").
    6. Return the output as a clean JSON object with the following structure:
    {
      "analysis": [
        {
          "name": "Recipe Name",
          "assessment": "well-balanced" | "needs improvement",
          "comment": "Consider increasing fiber intake to improve balance." | "This recipe is well-balanced and nutritious."
        },
        ...
      ],
      "summary": {
        "observations": [
          "Meals are consistently high in fiber.",
          "Several recipes contain excessive saturated fat."
        ],
        "advice": [
          "Incorporate more foods rich in Vitamin D to address deficiencies.",
          "Your nutrient balance is excellent; keep up the great work!"
        ],
        "foodscore": 0-100
      }
    }

    Do not include any additional text or comments in the response.


    Do not include any additional text or comments in the response.`;

  const requestData = {
    model: "qwen2.5:3b",
    prompt: prompt,
    stream: false,
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Réponse brute de l'IA :", response.data.response || response.data);

    if (response.data && response.data.response) {
      const rawResponse = response.data.response.trim();
      const startIndex = rawResponse.indexOf("{");
      const endIndex = rawResponse.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1) {
        const potentialJson = rawResponse.slice(startIndex, endIndex + 1);
        return JSON.parse(potentialJson);
      } else {
        throw new Error("Impossible d'extraire un JSON valide de la réponse brute.");
      }
    } else {
      throw new Error("Pas de réponse valide du modèle.");
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API :", error.message);
    if (error.response) {
      console.error("Détails de l'erreur :", error.response.data);
    }
    throw error;
  }
}

async function fetchAndAnalyzeNutrition(userId) {
  const apiUrl = `${backendBaseUrl}/api/nutrition/${userId}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.recipes) {
      const recipes = response.data.recipes;

      //console.log(`Données nutritionnelles brutes pour l'utilisateur ${userId}:`, recipes);

      try {
        // Appeler l'API pour analyser les données nutritionnelles
        return await analyzeNutritionData(recipes);
      } catch (analysisError) {
        console.error(`Erreur lors de l'analyse nutritionnelle pour l'utilisateur ${userId}:`, analysisError.message);
      }
    } else {
      console.error(`Impossible de récupérer les données nutritionnelles pour l'utilisateur ${userId}.`);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données nutritionnelles pour l'utilisateur ${userId}:`, error.message);
  }
}

module.exports = { fetchAndAnalyzeNutrition };
