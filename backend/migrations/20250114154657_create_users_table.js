exports.up = function (knex) {
	return knex.schema.createTable("users", function (table) {
		table.increments("id").primary();
		table.string("username", 100).notNullable();
		table.string("email", 100).unique().notNullable();
		table.string("password", 255).notNullable();
		table.boolean("isFirstLogin").defaultTo(true);
	});
};

exports.down = function (knex) {
	return knex.schema.dropTableIfExists("Users");
};
