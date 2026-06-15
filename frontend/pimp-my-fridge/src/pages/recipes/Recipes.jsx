import React, { useEffect, useState } from "react";
import RecipeModal from "../../components/recipemodal/RecipeModal.jsx";
import "./Recipes.css";

const Explore = () => {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const [recipes, setRecipes] = useState([]);
	const [selectedRecipeId, setSelectedRecipeId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const fetchRecipes = async () => {
			try {
				const response = await fetch(`${PREFIX_BACKEND}/api/recipes`);
				if (!response.ok) {
					throw new Error("Erreur lors du chargement des recettes");
				}
				const data = await response.json();
				setRecipes(data.data); // Assurez-vous que la structure de la réponse correspond à cette extraction
			} catch (error) {
				console.error("Erreur lors du chargement des recettes:", error);
			}
		};

		fetchRecipes();
	}, [PREFIX_BACKEND]);

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
			<h1>Explorez nos recettes</h1>
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
