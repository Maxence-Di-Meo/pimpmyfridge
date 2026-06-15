# Étape 1 : Configurer l'environnement de développement
FROM node:18
WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier tout le reste des fichiers sources
COPY . .

# Exposer le port utilisé par le mode développement
EXPOSE 3000

# Commande par défaut pour lancer l'application en mode développement
CMD ["npm", "run", "dev"]
