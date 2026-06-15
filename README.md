# PimpMyFridge

## Démarche pour utiliser l'application

Avant de commencer, suivez les étapes ci-dessous pour configurer et exécuter l'application correctement :

## Configuration des variables d'environnement

Avant de lancer le projet, vous devez créer des fichiers `.env` à la racine des répertoires backend et frontend. Ces fichiers doivent être basés sur le fichier `.env.format` fourni dans le répertoire backend.

### Backend

1. Naviguez vers le répertoire `backend`.
2. Créez un fichier nommé `.env`.
3. Copiez le contenu de `backend/.env.format` dans `backend/.env`.
4. Mettez à jour les valeurs dans `backend/.env` selon vos besoins.

### Frontend

1. Naviguez vers le répertoire `frontend/pimp-my-fridge`.
2. Créez un fichier nommé `.env`.
3. Copiez le contenu de `frontend/pimp-my-fridge/.env.format` dans `frontend/pimp-my-fridge/.env`.
4. Mettez à jour les valeurs dans `frontend/pimp-my-fridge/.env` selon vos besoins.

Assurez-vous de mettre à jour les variables d'environnement avec les valeurs appropriées pour votre configuration.

1. **Démarrer les services de l'application** :
   Placez-vous dans le répertoire du projet *pimpmyfridge* et exécutez :

   ```bash
   docker compose up --build
   ```

2. **Charger le modèle d'IA Qwen 3b** :
   Exécutez la commande suivante pour télécharger et activer le modèle Qwen 3b :

   ```bash
   curl -X POST http://localhost:11434/api/pull -d '{"name": "qwen2.5:3b"}'
   ```

3. **Accéder à l'application** :
   Une fois les services démarrés, accédez à l'interface utilisateur via votre navigateur en vous rendant à :

   ```
   http://localhost
   ```

4. **Récupération des Recettes** :
    Pour récupérer les recettes, vous devez créer un compte sur Spoonacular pour obtenir une clé d'API. Ajoutez cette clé dans votre fichier `.env` sous la variable `SPOONACULAR_API_KEY`.

    Ensuite, vous pouvez utiliser Postman pour faire une requête à l'URL `http://localhost:5001/api/search` avec le corps de la requête en JSON suivant :

    ```json
    {
        "number": X,
        "userId": X
    }
    Remplacez X par les valeurs appropriées. Notez que vous avez droit à 150 appels par jour et pas plus de 60 appels par minute.
    
---

## Objectifs du projet

**PimpMyFridge** vise à aider les utilisateurs à optimiser leur alimentation, leur planification de repas et leurs courses tout en prenant en compte leurs préférences, leurs besoins nutritionnels et leur impact environnemental.

### Fonctionnalités principales

#### IHM (Interface Homme-Machine)

- **Accessibilité multiplateforme** :
  - Compatible avec les navigateurs Web pour une utilisation facile sur ordinateur, tablette ou mobile.
- **Suggestion de recettes personnalisées** :
  - Affichage des recettes adaptées à l'utilisateur selon ses goûts, allergies et régime alimentaire.
- **Validation et ajustement des recettes** :
  - Permettre à l'utilisateur de modifier et valider les suggestions avant de générer une liste de courses.
- **Planification hebdomadaire des repas** :
  - Gérer les repas sur une semaine complète en fonction des objectifs de l'utilisateur.

#### Back-End

- **Gestion des données utilisateurs** :
  - Stockage des profils, préférences, restrictions et historiques.
- **Génération de listes de courses dynamiques** :
  - Regroupement des ingrédients en tenant compte des quantités pour éviter le gaspillage.
- **API Node.js** :
  - Communication fluide entre le front-end et les services back-end.

#### Services extérieurs

- **Spoonacular API** :
  - Extraction des recettes et des informations nutritionnelles.
- **Google Maps API** :
  - Localisation des magasins proches pour faciliter les courses.

#### Traitement des données

- **Algorithmes avancés** :
  - Proposition de recettes équilibrées en tenant compte des besoins nutritionnels.
  - Analyse de l'empreinte carbone des achats pour sensibiliser l'utilisateur.
- **IA (Qwen 3b)** :
  - Classification des ingrédients dans des catégories pertinentes.
  - Conversion des unités et consolidation des données pour simplifier la gestion des courses.

---

## Architecture technique

### Estimation du pourcentage de travail

| Catégorie              | % estimé du travail |
| ---------------------- | ------------------- |
| IHM (Front-End)        | 20%                 |
| Back-End               | 30%                 |
| Services Extérieurs    | 5%                  |
| Traitement des Données | 25%                 |
| IA                     | 20%                 |

### Technologies utilisées

#### Front-End

- **Framework principal** : React.js.
- **Bibliothèques UI** : Material-UI, TailwindCSS, Recharts.
- **Gestion d'état** : Redux.

#### Back-End

- **Langage** : Node.js avec Express.
- **Base de données** : PostgreSQL pour une gestion relationnelle robuste et Redis.
- **Outils supplémentaires** :
  - Authentification avec JWT.
  - Surveillance des erreurs avec Sentry.

#### Services extérieurs

- **Spoonacular API** : Récupération des recettes et données nutritionnelles.
- **Google Maps API** : Localisation des commerces.

#### Traitement des données

- **IA** : Qwen 3b pour la classification et l'analyse des listes de courses.

---

## Fonctionnement de l'analyse des listes de courses

### Flux des données

1. **Appel à l'API interne** :
   - L'API backend appelle l'endpoint `/api/listingredients/{userId}` pour récupérer les ingrédients liés à l'utilisateur.
2. **Envoi à Qwen 3b** :
   - Les ingrédients sont transformés en un json formaté.
   - Le modèle Qwen 3b analyse et regroupe les ingrédients dans des catégories telles que "viandes rouges", "pâtes/riz" ou "fruits de saison".
3. **Réponse JSON** :
   - Le modèle renvoie un JSON regroupé et formaté, utilisé pour générer des recommandations et des rapports d'empreinte carbone.

---

## Verrous identifiés

### IHM

- **Compatibilité multiplateforme** :
  - Assurer une expérience utilisateur cohérente entre ordinateurs, tablettes et mobiles.

### Back-End

- **Robustesse et scalabilité** :
  - Gérer un grand volume de données et assurer la résilience en cas de surcharge.

### Services extérieurs

- **Dépendance API** :
  - Gestion des pannes ou des latences des services externes comme Spoonacular ou Google Maps.

### Traitement des données

- **Optimisation des algorithmes** :
  - Regrouper efficacement les produits par catégories et minimiser les conflits entre contraintes utilisateur.

---

## Questions clés pour personnaliser l'application

1. **Données de base** :
   - Pour combien de personnes ?
2. **Budget** :
   - Quel est votre budget pour les repas (par jour, semaine) ?
3. **Restrictions alimentaires** :
   - Avez-vous des allergies ou intolérances alimentaires ?
   - Suivez-vous un régime particulier (vegan, casher, etc.) ?
4. **Préférences culinaires** :
   - Quels types de cuisines aimez-vous (italienne, asiatique, etc.) ?
5. **Temps disponible** :
   - Combien de temps pouvez-vous consacrer à la préparation des repas ?

---

## Conclusion

**PimpMyFridge** vise à résoudre les problèmes de gestion alimentaire et de planification en combinant une interface conviviale, une API performante et une IA avancée. Ce projet représente une solution complète pour optimiser la vie quotidienne des utilisateurs tout en étant écoresponsable.
