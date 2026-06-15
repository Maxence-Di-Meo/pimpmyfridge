const { redisClient, appPool } = require("../config/db");

// Initialisation de Redis
const initializeRedis = async userID => {
	try {
		const redisKey = `recipes:${userID}`; // Clé spécifique à l'utilisateur
		const cachedRecipes = await redisClient.get(redisKey);

		if (!cachedRecipes || JSON.parse(cachedRecipes).length === 0) {
			console.log(
				`Redis is empty or invalid for user ${userID}. Populating data from database...`
			);

			// Récupérer les recettes depuis la base de données
			const client = await appPool.connect();
			try {
				const result = await client.query("SELECT * FROM recipe LIMIT 21"); // Limiter à 21 recettes
				const recipes = result.rows;

				// Ajouter les recettes dans Redis pour cet utilisateur
				await redisClient.set(redisKey, JSON.stringify(recipes), { EX: 60 * 60 * 24 }); // Expiration : 24 heures
				console.log(`Recipes successfully populated in Redis for user ${userID}.`);
			} finally {
				client.release();
			}
		} else {
			console.log(`Recipes already exist in Redis for user ${userID}.`);
		}
	} catch (error) {
		console.error(`Error initializing Redis for user ${userID}:`, error);
	}
};

// Obtenir les recettes
const getRecipes = async (req, res) => {
	const { userID } = req.query;

	if (!userID) {
		return res.status(400).json({ error: "User ID is required." });
	}

	try {
		const today = new Date();
		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Début de la semaine (lundi)
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6); // Fin de la semaine (dimanche)

		const startOfNextWeek = new Date(endOfWeek);
		startOfNextWeek.setDate(startOfNextWeek.getDate() + 1); // Début de la semaine suivante (lundi)
		const endOfNextWeek = new Date(startOfNextWeek);
		endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // Fin de la semaine suivante (dimanche)

		const client = await appPool.connect();
		const query = `
            SELECT ur.urid, ur.recipeid, ur.datedue, r.name, r.image
            FROM "userRecipe" AS ur
            INNER JOIN recipe AS r ON ur.recipeid = r.recipeid
            WHERE ur.userid = $1 
              AND ur.datedue BETWEEN $2 AND $3
              OR ur.datedue BETWEEN $4 AND $5
            ORDER BY ur.datedue ASC;
        `;

		const result = await client.query(query, [
			userID,
			startOfWeek,
			endOfWeek,
			startOfNextWeek,
			endOfNextWeek,
		]);
		client.release();

		if (result.rows.length > 0) {
			const recipes = result.rows.map(recipe => ({
				recipeid: recipe.recipeid,
				datedue: recipe.datedue,
				name: recipe.name,
				image: recipe.image,
				isValidated: true, // Les recettes récupérées de la base sont validées
			}));
			return res.status(200).json({ recipes, isValidated: true });
		}

		// Si aucune recette validée, utilisez Redis pour générer les recettes
		await initializeRedis(userID);

		const redisKey = `recipes:${userID}`;
		const redisRecipes = JSON.parse(await redisClient.get(redisKey));
		if (!redisRecipes || redisRecipes.length === 0) {
			return res
				.status(404)
				.json({ error: "Aucune recette trouvée et aucune donnée dans Redis." });
		}

		const assignedRecipes = [];
		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(startOfWeek);
			currentDate.setDate(startOfWeek.getDate() + i);

			const localDate = new Date(
				currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
			)
				.toISOString()
				.split("T")[0]; // Date locale sans heure

			assignedRecipes.push(
				...redisRecipes.splice(0, 3).map(recipe => ({
					recipeid: recipe.recipeid,
					datedue: localDate,
					name: recipe.name,
					image: recipe.image,
					isValidated: false,
				}))
			);
		}

		return res.status(200).json({ recipes: assignedRecipes, isValidated: false });
	} catch (error) {
		console.error("Error fetching recipes:", error);
		res.status(500).json({ error: "Erreur interne lors de la récupération des recettes." });
	}
};



// Rejeter une recette
const rejectRecipe = async (req, res) => {
	const { recipeID, date, mealType, userID } = req.body;

	if (!recipeID || !date || !mealType || !userID) {
		return res.status(400).json({ error: "Paramètres manquants ou invalides." });
	}

	try {
		const redisKey = `recipes:${userID}`;
		const rejectedKey = `rejectedRecipes:${userID}`;

		// Récupérer les recettes actuelles
		const recipes = JSON.parse(await redisClient.get(redisKey)) || [];
		const rejectedRecipes = JSON.parse(await redisClient.get(rejectedKey)) || [];

		// Trouver et supprimer la recette rejetée
		const rejectedRecipe = recipes.find(recipe => recipe.recipeid === recipeID);
		if (!rejectedRecipe) {
			return res.status(404).json({ error: "Recette non trouvée." });
		}

		// Mettre à jour Redis
		await redisClient.set(
			redisKey,
			JSON.stringify(recipes.filter(recipe => recipe.recipeid !== recipeID))
		);
		await redisClient.set(rejectedKey, JSON.stringify([...rejectedRecipes, rejectedRecipe]));

		// Générer 3 nouvelles suggestions
		const client = await appPool.connect();
		try {
			const excludedIDs = rejectedRecipes.map(r => r.recipeid);

			const result = await client.query(
				`SELECT * FROM recipe WHERE recipeid NOT IN (${excludedIDs
					.map((_, i) => `$${i + 1}`)
					.join(",")}) ORDER BY RANDOM() LIMIT 3;`,
				excludedIDs
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Aucune suggestion disponible." });
			}

			const suggestions = result.rows.map(suggestion => ({
				id: suggestion.recipeid,
				title: suggestion.name,
				image: suggestion.image,
				instructions: suggestion.instructions,
				mealType,
				date,
				rejectedRecipeId: recipeID, // Identifiez la recette rejetée
			}));

			res.status(200).json({ suggestions });
		} finally {
			client.release();
		}
	} catch (error) {
		console.error("Erreur lors du rejet de la recette :", error);
		res.status(500).json({ error: "Erreur interne." });
	}
};

// Confirmer une recette unique
const confirmSingleRecipe = async (req, res) => {
	const { recipe } = req.body;

	try {
		const redisKey = "confirmedRecipes";
		let confirmedRecipes = JSON.parse(await redisClient.get(redisKey)) || [];

		// Ajouter la recette confirmée
		confirmedRecipes = [...confirmedRecipes, { ...recipe, status: "Validé" }];
		await redisClient.set(redisKey, JSON.stringify(confirmedRecipes));

		res.json({ message: "Recipe confirmed successfully." });
	} catch (error) {
		console.error("Error confirming recipe:", error);
		res.status(500).json({ error: "Error confirming recipe." });
	}
};

// Confirmer toutes les recettes
const confirmAllRecipes = async (req, res) => {
	const { recipes } = req.body;

	// Vérification que le tableau "recipes" est valide
	if (!recipes || !Array.isArray(recipes)) {
		return res.status(400).json({ error: "'recipes' doit être un tableau valide." });
	}

	try {
		const client = await appPool.connect();
		await client.query("BEGIN"); // Démarrer une transaction

		await client.query(
			`
            INSERT INTO shoppinglist (userid) 
            VALUES ($1)
        `,
			[recipes[0].userid]
		);


		for (const recipe of recipes) {
			// Validation stricte des champs requis
			if (!recipe.userid || !recipe.recipeid || !recipe.datedue) {
				await client.query("ROLLBACK");
				return res
					.status(400)
					.json({ error: `Recette invalide : ${JSON.stringify(recipe)}` });
			}

			// Insertion dans la table "userRecipe"
			await client.query(
				'INSERT INTO "userRecipe" (userid, recipeid, datedue) VALUES ($1, $2, $3)',
				[recipe.userid, recipe.recipeid, recipe.datedue]
			);
		}

		await client.query("COMMIT"); // Valider la transaction

		// Vider le cache Redis pour l'utilisateur
		const redisKey = `recipes:${recipes[0].userid}`; // Assurez-vous que `userid` est uniforme
		await redisClient.del(redisKey);
		console.log(`Cache Redis vidé pour l'utilisateur ${recipes[0].userid}.`);

		res.status(200).json({ message: "Toutes les recettes ont été confirmées avec succès." });
	} catch (error) {
		console.error("Erreur lors de la confirmation des recettes :", error);
		res.status(500).json({ error: "Erreur interne lors de la confirmation des recettes." });
	}
};

const getNextWeekRecipes = async (req, res) => {
	const { userID } = req.query;

	if (!userID) {
		return res.status(400).json({ error: "User ID is required." });
	}

	try {
		const redisKey = `nextWeekRecipes:${userID}`;
		const cachedRecipes = await redisClient.get(redisKey);

		if (!cachedRecipes) {
			return res
				.status(404)
				.json({ error: "Aucune recette trouvée pour la semaine suivante." });
		}

		const recipes = JSON.parse(cachedRecipes);
		res.status(200).json({ recipes });
	} catch (error) {
		console.error("Erreur lors de la récupération des recettes :", error);
		res.status(500).json({ error: "Erreur interne lors de la récupération des recettes." });
	}
};

const generateNextWeekRecipes = async (req, res) => {
	const { userID } = req.query;

	if (!userID) {
		return res.status(400).json({ error: "User ID is required." });
	}

	try {
		const startOfNextWeek = new Date();
		startOfNextWeek.setDate(startOfNextWeek.getDate() + (7 - startOfNextWeek.getDay()) + 1); // Prochain lundi
		const endOfNextWeek = new Date(startOfNextWeek);
		endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // Prochain dimanche

		const client = await appPool.connect();
		const recipeQuery = `
            SELECT recipeid, name, image FROM recipe
            ORDER BY RANDOM() LIMIT 21; -- 3 repas par jour pendant 7 jours
        `;
		const recipes = (await client.query(recipeQuery)).rows;

		const assignedRecipes = [];

		// Déclarer mealTypes ici
		const mealTypes = ["morning", "noon", "evening"];

		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(startOfNextWeek);
			currentDate.setDate(startOfNextWeek.getDate() + i);

			const localDate = new Date(
				currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
			)
				.toISOString()
				.split("T")[0]; // Date locale (sans heure)

			assignedRecipes.push(
				...recipes.splice(0, 3).map((recipe, index) => ({
					recipeid: recipe.recipeid,
					datedue: localDate,
					name: recipe.name,
					image: recipe.image,
					isValidated: false,
					mealType: mealTypes[index % 3], // Attribuer le type de repas
				}))
			);
		}

		const redisKey = `nextWeekRecipes:${userID}`;
		await redisClient.set(redisKey, JSON.stringify(assignedRecipes), { EX: 60 * 60 * 24 * 7 });

		res.status(201).json({
			message: "Recettes générées pour la semaine suivante.",
			recipes: assignedRecipes,
		});
	} catch (error) {
		console.error("Erreur lors de la génération des recettes :", error);
		res.status(500).json({ error: "Erreur interne lors de la génération des recettes." });
	}
};

const clearCache = async (req, res) => {
	const { userID } = req.query;

	if (!userID) {
		return res.status(400).json({ error: "User ID is required." });
	}

	try {
		const redisKey = `recipes:${userID}`;
		await redisClient.del(redisKey);
		console.log(`Cache Redis vidé pour l'utilisateur ${userID}.`);
		res.status(200).json({ message: "Cache Redis vidé avec succès." });
	} catch (error) {
		console.error("Erreur lors du nettoyage du cache Redis :", error);
		res.status(500).json({ error: "Erreur interne lors du nettoyage du cache Redis." });
	}
};

module.exports = {
	initializeRedis,
	getRecipes,
	rejectRecipe,
	confirmSingleRecipe,
	confirmAllRecipes,
	getNextWeekRecipes,
	generateNextWeekRecipes,
	clearCache,
};
