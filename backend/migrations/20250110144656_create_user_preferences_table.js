exports.up = function (knex) {
	return knex.schema.createTable("userPreferences", function (table) {
		table.increments("id").primary(); // Colonne id
		table.integer("userId").notNullable().unique(); // Colonne userId avec contrainte d'unicité
		table.json("intolerances"); // Colonne intolerances (objet)
		table.json("cuisines"); // Colonne cuisines (objet)
		table.json("diets"); // Colonne diets (objet)
		table.json("excludeIngredients"); // Colonne excludeIngredients (objet)
		table.integer("maxReadyTime"); // Colonne maxReadyTime (number)
		table.integer("servings").notNullable(); // Colonne servings (number, not null)
	});
};

exports.down = function (knex) {
	return knex.schema.dropTableIfExists("userPreferences");
};
