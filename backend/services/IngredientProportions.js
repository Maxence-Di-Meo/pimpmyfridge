const axios = require("axios");
const { backendBaseUrl, ollamaBaseUrl } = require("../config/serviceUrls");

// Fonction pour nettoyer et analyser la liste de courses
async function cleanAndFormatShoppingList(shoppingList) {
  const apiUrl = `${ollamaBaseUrl}/api/generate`;
  //const apiUrl = "http://localhost:11434/api/generate";
  const prompt = `
    You are an AI tasked with cleaning, standardizing, and reformatting a shopping list. 
    Given the following input list:

    ${JSON.stringify(shoppingList, null, 2)}

    ### Instructions:
    1. Standardize ingredient names (e.g., "garlic clove" and "garlic cloves" should be merged into "garlic").
    2. Do not add or remove ingredients, just merge similar names.
    3. Consolidate quantities only if the units match (e.g., merge "ml" with "ml" or "g" with "g").
    4. Use only metric units (e.g., ml, g, kg). Convert any non-metric units (e.g., "cups", "oz", "lbs", "tsps", "tsp") to metric equivalents.
    5. Return the output in the exact JSON format below. If an ingredient has multiple units (e.g., ml and Tbs), create a separate entry for each unit.

    ### Expected Output Format:
    {
      "ingredient_name": {
        "unit": "unit_name",
        "amount": numeric_value
      },
      "another_ingredient": {
        "unit": "unit_name",
        "amount": numeric_value
      }
    }

    ### Rules for output:
    - Return only the JSON object. Do not include any additional text, comments, or explanations in the response.
    - Ensure the JSON object starts with '{' and ends with '}'.
    - Strictly follow the format and do not deviate.
  `;

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

    if (response.data && response.data.response) {
      const rawResponse = response.data.response.trim();
      const cleanResponse = rawResponse.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanResponse);
    } else {
      throw new Error("Invalid response from AI model.");
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API :", error.message);
    throw error;
  }
}

// Fonction principale pour récupérer et traiter la liste de courses pour un utilisateur
async function fetchAndFormatShoppingList(userId) {
  const apiUrl = `${backendBaseUrl}/api/shopping-list/${userId}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data && response.data.shoppingList) {
      const shoppingList = response.data.shoppingList;
      console.log("Données brutes de la liste de courses :", shoppingList);

      // Nettoyer et formater la liste d'ingrédients
      try {
        const cleanedList = await cleanAndFormatShoppingList(shoppingList);
        //console.log("Liste nettoyée et formatée :", cleanedList);
        return cleanedList;
      } catch (error) {
        console.error(
          `Erreur lors du nettoyage et de la mise en forme de la liste pour l'utilisateur ${userId} :`,
          error.message
        );
        throw error;
      }
    } else {
      throw new Error("Aucune liste de courses trouvée pour l'utilisateur.");
    }
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la liste de courses pour l'utilisateur ${userId} :`,
      error.message
    );
    throw error;
  }
}

module.exports = { fetchAndFormatShoppingList };
