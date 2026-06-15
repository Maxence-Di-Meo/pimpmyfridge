exports.up = function (knex) {
	return knex.schema.createTable("recipe", function (table) {
		table.increments("recipeid").primary(); // Clé primaire auto-incrémentée
		table.string("name", 100).notNullable(); // Nom de la recette
		table.text("instruction", 4000); // Instructions de la recette
		table.jsonb("nutrient"); // Données nutritionnelles (JSONB)
		table.integer("cost_level"); // Niveau de coût
		table.boolean("tested").defaultTo(false); // Indique si la recette a été testée
		table.date("testeddate"); // Date du test
		table.integer("mealtype"); // Type de repas
		table.text("image"); // URL ou données de l'image
		table.jsonb("flavonoids"); // Informations sur les flavonoïdes
		table.jsonb("caloric_breakdown"); // Répartition calorique
		table.jsonb("weight_per_serving"); // Poids par portion
		table.jsonb("properties"); // Propriétés additionnelles
		table.jsonb("ingredient"); // Liste d'ingrédients
	});
};

exports.down = function (knex) {
	return knex.schema.dropTableIfExists("recipe");
};
