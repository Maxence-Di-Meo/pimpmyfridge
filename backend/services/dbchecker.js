const { appPool } = require("../config/db");
const { analyzeShoppingListByUserId } = require("./Impact");
const { fetchAndAnalyzeNutrition } = require("./NutritionAnalysis");
const { fetchAndFormatShoppingList } = require("./IngredientProportions");


async function processShoppingList() {
  let client;

  try {
    client = await appPool.connect();

    const query = `
      SELECT userid
      FROM shoppinglist
      WHERE listingredients IS NULL
      LIMIT 1 FOR UPDATE SKIP LOCKED;
    `;
    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.log("Aucune ligne avec listingredients NULL.");
      return false;
    }

    const { userid } = result.rows[0];
    console.log(`Génération de la liste des ingrédients pour l'utilisateur ${userid}`);

    const shoppingListResult = await fetchAndFormatShoppingList(userid);

    if (shoppingListResult) {
      const updateQuery = `
        UPDATE shoppinglist
        SET listingredients = $1
        WHERE userid = $2;
      `;
      await client.query(updateQuery, [JSON.stringify(shoppingListResult), userid]);
      console.log(`Liste des ingrédients mise à jour pour l'utilisateur ${userid}`);
      return true;
    } else {
      console.log(`Erreur lors de la génération de la liste des ingrédients pour l'utilisateur ${userid}`);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors du traitement de listingredients :", error.message);
    return false;
  } finally {
    if (client) client.release();
  }
}
// Fonction pour traiter `nutrition_summary`
async function processNutritionSummary() {
    let client;
  
    try {
      client = await appPool.connect(); // Obtenir une connexion au pool
  
      const query = `
        SELECT userid
        FROM shoppinglist
        WHERE nutrition_summary IS NULL
        LIMIT 1 FOR UPDATE SKIP LOCKED;
      `;
  
      const result = await client.query(query); // Effectuer la requête
  
      if (result.rows.length === 0) {
        console.log("Aucune ligne avec nutrition_summary NULL.");
        return false;
      }
  
      const { userid } = result.rows[0];
      console.log(`Analyse nutritionnelle pour l'utilisateur ${userid}`);
  
      const nutritionAnalysisResult = await fetchAndAnalyzeNutrition(userid);
  
      if (
        nutritionAnalysisResult &&
        nutritionAnalysisResult.summary &&
        Array.isArray(nutritionAnalysisResult.analysis)
      ) {
        const updateQuery = `
          UPDATE shoppinglist
          SET nutrition_summary = $1
          WHERE userid = $2;
        `;
        await client.query(updateQuery, [
          JSON.stringify(nutritionAnalysisResult),
          userid,
        ]);
        console.log(`Résumé nutritionnel enregistré pour l'utilisateur ${userid}`);
        return true;
      } else {
        console.log(
          `Format de réponse invalide pour le résumé nutritionnel de l'utilisateur ${userid}.`
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Erreur lors du traitement de nutrition_summary :",
        error.message
      );
      return false;
    } finally {
      if (client) client.release(); // Libérer la connexion au pool
    }
  }
  
  // Fonction pour traiter `carbon_impact`
  async function processCarbonImpact() {
    let client;
  
    try {
      client = await appPool.connect(); // Obtenir une connexion au pool
  
      const query = `
        SELECT userid
        FROM shoppinglist
        WHERE carbon_impact IS NULL
        LIMIT 1 FOR UPDATE SKIP LOCKED;
      `;
  
      const result = await client.query(query); // Effectuer la requête
  
      if (result.rows.length === 0) {
        console.log("Aucune ligne avec carbon_impact NULL.");
        return false;
      }
  
      const { userid } = result.rows[0];
      console.log(`Analyse de l'empreinte carbone pour l'utilisateur ${userid}`);
  
      const carbonAnalysisResult = await analyzeShoppingListByUserId(userid);
  
      if (carbonAnalysisResult && typeof carbonAnalysisResult === "object") {
        // Conversion des unités si nécessaire
        for (const [key, value] of Object.entries(carbonAnalysisResult)) {
          if (!value.unit) {
            value.unit = "kg"; // Défaut pour les unités manquantes
          }
          if (value.unit === "g") {
            value.totalAmount /= 1000; // Conversion en kilogrammes
            value.unit = "kg";
          }
        }
  
        const updateQuery = `
          UPDATE shoppinglist
          SET carbon_impact = $1
          WHERE userid = $2;
        `;
        await client.query(updateQuery, [JSON.stringify(carbonAnalysisResult), userid]);
        console.log(`Empreinte carbone enregistrée pour l'utilisateur ${userid}`);
        return true;
      } else {
        console.log(
          `Format de réponse invalide pour l'empreinte carbone de l'utilisateur ${userid}.`
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Erreur lors du traitement de carbon_impact :",
        error.message
      );
      return false;
    } finally {
      if (client) client.release(); // Libérer la connexion au pool
    }
  }

// Les autres fonctions restent inchangées...

async function checkAndProcessData() {
  console.log("Démarrage du service de traitement...");

  while (true) {
    const shoppingProcessed = await processShoppingList();
    if (!shoppingProcessed) console.log("Aucune mise à jour de liste des ingrédients.");

    const nutritionProcessed = await processNutritionSummary();

    if (nutritionProcessed) {
      console.log("Analyse nutritionnelle terminée. Réinitialisation pour la prochaine vérification...");
    } else {
      console.log("Aucune analyse nutritionnelle effectuée. Vérification de l'empreinte carbone...");
    }

    const carbonProcessed = await processCarbonImpact();

    if (carbonProcessed) {
      console.log("Analyse de l'empreinte carbone terminée. Réinitialisation pour la prochaine vérification...");
    } else {
      console.log("Aucune analyse de l'empreinte carbone effectuée.");
    }
    
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Pause de 5 secondes
  }
}

//checkAndProcessData();
module.exports = { checkAndProcessData };
