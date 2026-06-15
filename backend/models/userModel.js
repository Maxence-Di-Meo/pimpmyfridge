const { appPool } = require("../config/db");

const createUser = async (username, email, passwordHash) => {
	const query = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
	const values = [username, email, passwordHash];
	const result = await appPool.query(query, values);
	return result.rows[0];
};

const createUserPreferences = async (
	userId,
	intolerances,
	cuisines,
	diets,
	excludeIngredients,
	maxReadyTime,
	servings
) => {
	const query = `
        INSERT INTO public."userPreferences" ("userId", intolerances, cuisines, diets, "excludeIngredients", "maxReadyTime", servings)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
	const values = [
		userId,
		JSON.stringify(intolerances),
		JSON.stringify(cuisines),
		JSON.stringify(diets),
		JSON.stringify(excludeIngredients),
		maxReadyTime,
		servings,
	];
	const result = await appPool.query(query, values);
	return result.rows[0];
};

const updateIsFirstLogin = async userId => {
	const query = `UPDATE users SET "isFirstLogin" = $1 WHERE id = $2`;
	const values = [false, userId];
	await appPool.query(query, values);
};

const getUserPreferencesfromUserId = async userId => {
	const query = 'SELECT * FROM public."userPreferences" WHERE "userId" = $1';
	const values = [userId];
	const result = await appPool.query(query, values);
	return result.rows[0];
};

const updateUserPreferencesfromUserId = async (
	userId,
	intolerances,
	cuisines,
	diets,
	excludeIngredients,
	maxReadyTime,
	servings
) => {
	const query = `
        UPDATE public."userPreferences"
        SET intolerances = $2,
            cuisines = $3,
            diets = $4,
            "excludeIngredients" = $5,
            "maxReadyTime" = $6,
            servings = $7
        WHERE "userId" = $1
        RETURNING *`;
	const values = [
		userId,
		JSON.stringify(intolerances),
		JSON.stringify(cuisines),
		JSON.stringify(diets),
		JSON.stringify(excludeIngredients),
		maxReadyTime,
		servings,
	];
	const result = await appPool.query(query, values);
	return result.rows[0];
};

module.exports = {
	createUser,
	createUserPreferences,
	updateIsFirstLogin,
	getUserPreferencesfromUserId,
	updateUserPreferencesfromUserId,
};
