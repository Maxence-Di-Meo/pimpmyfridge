const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
	createUser,
	createUserPreferences,
	updateIsFirstLogin,
	getUserPreferencesfromUserId,
	updateUserPreferencesfromUserId,
} = require("../models/userModel");
const { appPool } = require("../config/db");

const registerUser = async (req, res) => {
	const { username, email, password } = req.body;

	// Vérification si l'utilisateur existe déjà
	const existingUser = await appPool.query("SELECT * FROM users WHERE email = $1", [email]);
	if (existingUser.rows.length > 0) {
		return res.status(400).json({ message: "Email déjà utilisé." });
	}

	// Hasher le mot de passe
	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);

	// Créer un nouvel utilisateur
	const newUser = await createUser(username, email, passwordHash);

	// Créer un token JWT
	const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

	res.status(201).json({ token, user: newUser });
};

const loginUser = async (req, res) => {
	const { email, password } = req.body;

	// Vérification si l'utilisateur existe
	const existingUser = await appPool.query("SELECT * FROM users WHERE email = $1", [email]);
	if (existingUser.rows.length === 0) {
		return res.status(400).json({ message: "Email ou mot de passe incorrect." });
	}

	const user = existingUser.rows[0];

	// Vérification du mot de passe
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(400).json({ message: "Email ou mot de passe incorrect." });
	}

	// Créer un token JWT
	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

	res.status(200).json({ token, user });
};

const setUserPreferences = async (req, res) => {
	const { userId, intolerances, cuisines, diets, excludeIngredients, maxReadyTime, servings } =
		req.body;

	const preferences = await createUserPreferences(
		userId,
		intolerances,
		cuisines,
		diets,
		excludeIngredients,
		maxReadyTime,
		servings
	);

	await updateIsFirstLogin(userId);

	res.status(201).json({ message: "Préférences utilisateur créées avec succès.", preferences });
};

const getUserPreferences = async (req, res) => {
	const { userId } = req.params;

	try {
		const preferences = await getUserPreferencesfromUserId(userId);
		if (!preferences) {
			return res
				.status(404)
				.json({ message: "Aucune préférence trouvée pour cet utilisateur." });
		}
		res.status(200).json(preferences);
	} catch (error) {
		console.error("Erreur lors de la récupération des préférences :", error);
		res.status(500).json({ message: "Erreur interne du serveur." });
	}
};

const updateUserPreferences = async (req, res) => {
	const { userId, intolerances, cuisines, diets, excludeIngredients, maxReadyTime, servings } =
		req.body;

	try {
		const updatedPreferences = await updateUserPreferencesfromUserId(
			userId,
			intolerances,
			cuisines,
			diets,
			excludeIngredients,
			maxReadyTime,
			servings
		);
		res.status(200).json({
			message: "Préférences utilisateur mises à jour avec succès.",
			updatedPreferences,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour des préférences :", error);
		res.status(500).json({ message: "Erreur interne du serveur." });
	}
};

module.exports = {
	registerUser,
	loginUser,
	setUserPreferences,
	getUserPreferences,
	updateUserPreferences,
};
