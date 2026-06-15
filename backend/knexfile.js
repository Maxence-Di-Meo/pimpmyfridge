// Update with your config settings.
require("dotenv").config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	client: "pg",
	connection: {
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
		database: process.env.APP_DB_NAME,
	},
	migrations: {
		tableName: "knex_migrations",
		directory: "./migrations",
	},
};
