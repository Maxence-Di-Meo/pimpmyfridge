# Projet Pimp My fridge Backend Nodde.js

## Installation

1. Cloner le projet
2. Installer les dépendances `npm install`
3. Lancer le serveur `npm start`

## Migration

1. Créer une migration `npx knex migrate:make --migration name`Exemple : `npx knex migrate:make add_age_to_users`
2. Cela va créer un fichier dans le dossier `migrations`
3. Remplir le fichier avec les instructions de migration
    ```javascript
    exports.up = function(knex) {
        return knex.schema.table('users', function(t) {
            t.integer('age');
        });
    };

    exports.down = function(knex) {
        return knex.schema.table('users', function(t) {
            t.dropColumn('age');
        });
    };
    ```
4. Exécuter les migrations `npx knex migrate:latest`
5. Si besoin, pour annuler la migration `npx knex migrate:rollback`