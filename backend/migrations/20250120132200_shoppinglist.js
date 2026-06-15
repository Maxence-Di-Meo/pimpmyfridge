exports.up = function (knex) {
	return knex.schema.createTable("shoppinglist", function (table) {
		table.increments("id").primary();
		table.integer("userid").notNullable().references("id").inTable("users").onDelete("CASCADE");
		table.jsonb("listingredients");
        table.jsonb("nutrition_summary");
        table.jsonb("carbon_impact");
		table.date("created_at");
	});
};

exports.down = function (knex) {
	return knex.schema.dropTableIfExists("shoppinglist");
};
