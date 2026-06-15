import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import RecipeModal from "../../components/recipemodal/RecipeModal.jsx";
import "../recipes/Recipes.css";

const Explore = () => {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const [recipes, setRecipes] = useState([]);
	const [selectedRecipeId, setSelectedRecipeId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Récupérer l'utilisateur connecté depuis Redux
	const currentUser = useSelector(state => state.userReducer.user);
	const userId = currentUser.id;

	useEffect(() => {
		const fetchRecipes = async () => {
			try {
				const response = await fetch(`${PREFIX_BACKEND}/api/myrecipes/${userId}`);
				if (!response.ok) {
					throw new Error("Erreur lors du chargement des recettes");
				}
				const data = await response.json();
				setRecipes(data.data); // Assurez-vous que le backend retourne les données dans la clé `data`
			} catch (error) {
				console.error("Erreur lors du chargement des recettes :", error);
			}
		};

		if (userId) {
			fetchRecipes();
		}
	}, [userId, PREFIX_BACKEND]);

	const openModal = recipeId => {
		setSelectedRecipeId(recipeId);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedRecipeId(null);
	};

	return (
		<div className="explore-page">
			<h1>Tes recettes !</h1>
			<h2>Enfin celles que tu as prévu ou essayé de faire ...</h2>
			<div className="recipes-grid">
				{recipes.map(recipe => (
					<div
						key={recipe.recipeid}
						className="recipe-card"
						onClick={() => openModal(recipe.recipeid)}
					>
						<div className="recipe-link">
							<img src={recipe.image} alt={recipe.name} className="recipe-image" />
							<h3 className="recipe-title">{recipe.name}</h3>
						</div>
					</div>
				))}
			</div>

			<RecipeModal recipeId={selectedRecipeId} isOpen={isModalOpen} onClose={closeModal} />
		</div>
	);
};

export default Explore;
