import React, { useState, useEffect } from "react";

const ChangeRecipeModal = ({ date, mealType, onClose }) => {
	const [recipes, setRecipes] = useState([]);

	// Charger des alternatives depuis l'API
	useEffect(() => {
		fetch("/meal-planner/change", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ date, mealType, user_id: 1 }),
		})
			.then(res => res.json())
			.then(data => setRecipes(data));
	}, [date, mealType]);

	return (
		<div className="recipe-modal">
			<h2>Choisissez une autre recette pour {mealType}</h2>
			<ul>
				{recipes.map(recipe => (
					<li key={recipe.id}>
						<p>
							{recipe.name} ({recipe.calories} kcal)
						</p>
						<button onClick={() => alert(`Recette choisie : ${recipe.name}`)}>
							Choisir
						</button>
					</li>
				))}
			</ul>
			<button onClick={onClose} className="close-btn">
				Fermer
			</button>
		</div>
	);
};

export default ChangeRecipeModal;
