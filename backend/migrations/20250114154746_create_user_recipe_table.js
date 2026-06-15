exports.up = function (knex) {
	return knex.schema.createTable("userRecipe", function (table) {
		table.increments("urid").primary();
		table.integer("userid").notNullable().references("id").inTable("users").onDelete("CASCADE");
		table
			.integer("recipeid")
			.notNullable()
			.references("recipeid")
			.inTable("recipe")
			.onDelete("CASCADE");
		table.date("datedue");
	});
};

exports.down = function (knex) {
	return knex.schema.dropTableIfExists("UserRecipe");
};
