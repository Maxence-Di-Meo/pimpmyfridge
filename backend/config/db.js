const { Pool } = require("pg");
const redis = require("redis");
require("dotenv").config();

const appDatabaseName = process.env.APP_DB_NAME || "pimpmyfridge_db";
if (!/^[a-zA-Z0-9_]+$/.test(appDatabaseName)) {
	throw new Error("APP_DB_NAME doit contenir uniquement des lettres, chiffres ou underscores.");
}

// Connexion à PostgreSQL pour l'administration
const adminPool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
});

// Connexion à PostgreSQL pour l'application
const appPool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: appDatabaseName,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

//Configuration Redis
const redisClient = redis.createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

const connectRedis = async () => {
	if (redisClient.isOpen) {
		return;
	}
	try {
		await redisClient.connect();
		console.log("Redis connecté !");
	} catch (err) {
		console.error("Erreur lors de la connexion à Redis :", err);
	}
};

if (process.env.NODE_ENV !== "test") {
	connectRedis();
}

const initDatabase = async () => {
	const client = await adminPool.connect();
	try {
		const res = await client.query(`
            SELECT 1 FROM pg_database WHERE datname = $1;
        `, [appDatabaseName]);

		if (res.rowCount === 0) {
			console.log("La base de données n'existe pas. Création en cours...");
			await client.query(`CREATE DATABASE ${appDatabaseName};`);
			console.log(`Base de données '${appDatabaseName}' créée avec succès.`);
		} else {
			console.log(`La base de données '${appDatabaseName}' existe déjà.`);
		}
	} catch (err) {
		console.error("Erreur lors de la vérification/création de la base :", err);
	} finally {
		client.release();
	}
};

module.exports = {
	initDatabase,
	appPool,
	redisClient,
	connectRedis,
};
