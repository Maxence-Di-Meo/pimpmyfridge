const axios = require("axios");
const { backendBaseUrl, ollamaBaseUrl } = require("../config/serviceUrls");

async function getSeasonalIngredientsAndCarbonFootprint(listingredients) {
    if (!Array.isArray(listingredients) || listingredients.length === 0) {
        throw new Error("Liste des ingrédients vide ou mal formatée.");
    }

    const apiUrl = `${ollamaBaseUrl}/api/generate`;
    //const apiUrl = "http://localhost:11434/api/generate";
    const currentDate = new Date().toISOString().split("T")[0];

    const prompt = `
    You are an AI tasked with classifying ingredients into categories and summing their total amounts per category. Convert all units to kilograms (kg) for weight or liters (L) for volume.

    ### Categories:
    - Red meat (beef, veal, lamb)
    - White meat (chicken, pork, rabbit, poultry)
    - Fish/crustaceans (wild-caught)
    - Farmed shrimp
    - Seasonal fruits or vegetables
    - Exotic fruits or vegetables
    - Cheese/dairy/eggs
    - Pasta/rice
    - Wine/beer
    - Juice/soda/water

    ### Instructions:
    1. Classify each ingredient into one of the categories above.
    2. Convert all amounts to a single unit and sum all amounts in the same category :
    - Kilograms (kg) for weight-based categories.
    - Liters (L) for volume-based categories.
    3. Return the output in the following JSON format:
    {
    "category_name": {
        "totalAmount": numeric_value,
        "unit": "kg" or "L"
    },
    "another_category_name": {
        "totalAmount": numeric_value,
        "unit": "kg" or "L"
    }
    }

    ### Rules:
    - Do not include any additional fields or explanations.
    - Perform all calculations and ensure the final JSON is well-formed.
    - Do not include any comments, explanations, or extra text in the output.

    ### Input List:
    ${JSON.stringify(listingredients, null, 2)}
    `;

    const requestData = {
        model: "qwen2.5:3b",
        prompt: prompt,
        stream: false,
    };



    try {
        const response = await axios.post(apiUrl, requestData, {
            headers: { "Content-Type": "application/json" },
        });

        console.log("Réponse brute de l'IA :", response.data.response || response.data);

        if (response.data?.response) {
            const rawResponse = response.data.response.trim();

            // Extraction de la partie JSON valide
            const startIndex = rawResponse.indexOf("{");
            const endIndex = rawResponse.lastIndexOf("}");
            if (startIndex !== -1 && endIndex !== -1) {
                const jsonResponse = rawResponse.slice(startIndex, endIndex + 1);
                return JSON.parse(jsonResponse);
            }
            throw new Error("Réponse de l'IA mal formatée. Impossible d'extraire un JSON valide.");
        }
        throw new Error("Pas de réponse valide du modèle.");
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API :", error.message);
        throw error;
    }
}

async function analyzeShoppingListByUserId(userId) {
    const apiUrl = `${backendBaseUrl}/api/listingredients/${userId}`;

    try {
        const response = await axios.get(apiUrl);

        if (response.data?.shoppingLists?.length > 0) {
            const list = response.data.shoppingLists[0]?.listingredients;

            if (!list || Object.keys(list).length === 0) {
                throw new Error(`Liste d'ingrédients vide ou absente pour l'utilisateur ${userId}.`);
            }

            // Transformation en tableau pour l'IA
            const formattedIngredients = Object.entries(list).flatMap(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(item => ({
                        name: key,
                        unit: item.unit,
                        amount: item.amount,
                    }));
                }
                return { name: key, unit: value.unit, amount: value.amount };
            });

            //console.log(`Ingrédients formatés pour l'utilisateur ${userId} :`, formattedIngredients);
            return await getSeasonalIngredientsAndCarbonFootprint(formattedIngredients);
        }
        throw new Error(`Aucune liste trouvée pour l'utilisateur ${userId}.`);
    } catch (error) {
        console.error(`Erreur pour l'utilisateur ${userId} :`, error.message);
        throw error;
    }
}

module.exports = { analyzeShoppingListByUserId };
