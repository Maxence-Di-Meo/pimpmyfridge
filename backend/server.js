const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const apiRoutes = require("./routes/apiRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const shoppinglistRoutes = require("./routes/shoppinglistRoutes");
const getRecentRecipeAndNutritionSummary = require("./routes/nutritionRoutes");
const mealRoutes = require("./routes/mealRoutes");
const listingredientsRoutes = require("./routes/listingredientsRoutes");
const { connectRedis, initDatabase } = require("./config/db");
const knex = require("knex")(require("./knexfile"));
const geolocationRoutes = require("./routes/geolocationRoutes");
const getMyRecipesController = require("./routes/myrecipesRoutes");
const { checkAndProcessData } = require("./services/dbchecker");



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5001;

// Utilisation des routes
app.use("/api/users", userRoutes);
app.use("/api/myrecipes", getMyRecipesController);
app.use("/api/recipes", recipeRoutes);
app.use("/api/search", apiRoutes);
app.use("/api/recipe", mealRoutes);
app.use("/api/shopping-list", shoppinglistRoutes);
app.use("/api/nutrition", getRecentRecipeAndNutritionSummary);
app.use("/api/listingredients", listingredientsRoutes);
app.use("/api/meal", mealRoutes);
app.use("/api/geolocation", geolocationRoutes);

// Fonction pour vérifier et exécuter les migrations
const checkMigrations = async () => {
	try {
		await knex.migrate.latest();
		console.log("Migrations exécutées avec succès.");
	} catch (err) {
		console.error("Erreur lors de l'exécution des migrations :", err);
		throw err;
	}
};

// Initialisation de la base de données et des tables
const startServer = async () => {
	try {
		await initDatabase();
		await connectRedis();
		await checkMigrations();

		// Lancer le serveur
		app.listen(PORT, "0.0.0.0", () => {
			console.log(`Serveur en écoute sur http://localhost:${PORT}`);
		});
		await checkAndProcessData();
	} catch (err) {
		console.error("Erreur lors de l'initialisation :", err);
	}
};

// Exporter l'application pour les tests
module.exports = { app, startServer };

// Lancer le serveur si ce fichier est exécuté directement
if (require.main === module) {
	startServer();
}
