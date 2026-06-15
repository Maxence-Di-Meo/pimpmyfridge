import React, { useEffect, useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	PieChart,
	Pie,
	Cell,
	Legend,
	RadarChart,
	Radar,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
} from "recharts";
import "./RecipeModal.css";

const RecipeModal = ({ recipeId, isOpen, onClose }) => {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const [recipe, setRecipe] = useState(null);
	const [ingredients, setIngredients] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!recipeId || !isOpen) return;

		const fetchRecipeData = async () => {
			console.log("Chargement des détails de la recette pour l'ID :", recipeId);

			setLoading(true);
			setError(null);
			try {
				const response = await fetch(`${PREFIX_BACKEND}/api/recipes/${recipeId}`);
				if (!response.ok)
					throw new Error("Erreur lors du chargement des détails de la recette");
				const data = await response.json();

				setRecipe(data);

				const formattedIngredients = (data.ingredient || []).map(ingredient => ({
					name: ingredient.name || "Ingrédient inconnu",
					unit: ingredient.unit || "",
					amount: ingredient.amount || 0,
				}));

				setIngredients(formattedIngredients);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchRecipeData();
	}, [recipeId, isOpen, PREFIX_BACKEND]);

	if (!isOpen) return null;

	if (loading) return <p>Chargement...</p>;
	if (error) return <p>Erreur : {error}</p>;
	if (!recipe) return <p>Aucune recette trouvée.</p>;

	const nutrientData = recipe.nutrient
		? Object.entries(recipe.nutrient).map(([key, value]) => ({
				name: value.name,
				amount: value.amount,
				unit: value.unit,
			}))
		: [];

	const caloricData = recipe.caloric_breakdown
		? Object.entries(recipe.caloric_breakdown).map(([key, value]) => ({
				name: key.replace("percent", ""),
				value: parseFloat(value),
			}))
		: [];

	const macroData = nutrientData.filter(n =>
		["Calories", "Fat", "Protein", "Carbohydrates"].includes(n.name)
	);

	const vitaminMineralData = nutrientData.filter(n =>
		[
			"Vitamin C",
			"Potassium",
			"Calcium",
			"Iron",
			"Magnesium",
			"Folate",
			"Vitamin B6",
			"Vitamin B1",
			"Zinc",
		].includes(n.name)
	);

	const negativeData = nutrientData.filter(n =>
		["Saturated Fat", "Sugar", "Alcohol", "Sodium"].includes(n.name)
	);

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={e => e.stopPropagation()}>
				<button className="close-button" onClick={onClose}>
					&times;
				</button>
				<h2>{recipe.name}</h2>
				<img src={recipe.image} alt={recipe.name} />

				<h3>Ingrédients :</h3>
				<ul>
					{ingredients.map((ingredient, index) => (
						<li key={index}>
							{ingredient.name} - {ingredient.amount} {ingredient.unit}
						</li>
					))}
				</ul>

				<h3>Instructions :</h3>
				<p>{recipe.instruction || "Aucune instruction disponible."}</p>

				<h2>Graphique des Nutriments</h2>
				<BarChart width={800} height={300} data={nutrientData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
					<YAxis />
					<Tooltip
						formatter={(value, name, { payload }) => [`${value} ${payload.unit}`, name]}
					/>
					<Bar dataKey="amount" fill="#8884d8" />
				</BarChart>

				<h2>Répartition Calorique</h2>
				<PieChart width={600} height={400}>
					<Pie
						data={caloricData}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={120}
						fill="#8884d8"
						label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
					>
						{caloricData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={["#0088FE", "#FFBB28", "#FF8042"][index % 3]}
							/>
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>

				<h2>Macronutriments</h2>
				<BarChart width={800} height={300} data={macroData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip formatter={value => `${value}`} />
					<Bar dataKey="amount" fill="#82ca9d" />
				</BarChart>

				<h2>Vitamines et Minéraux</h2>
				<RadarChart outerRadius={150} width={600} height={400} data={vitaminMineralData}>
					<PolarGrid />
					<PolarAngleAxis dataKey="name" />
					<PolarRadiusAxis angle={30} />
					<Tooltip />
					<Radar
						name="Vitamines"
						dataKey="amount"
						stroke="#8884d8"
						fill="#8884d8"
						fillOpacity={0.6}
					/>
				</RadarChart>

				<h2>Éléments à Surveiller</h2>
				<PieChart width={600} height={400}>
					<Pie
						data={negativeData}
						dataKey="amount"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={120}
						fill="#FF8042"
						label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
					>
						{negativeData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={["#FFBB28", "#FF8042", "#FF0000", "#0088FE"][index % 4]}
							/>
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>
			</div>
		</div>
	);
};

export default RecipeModal;
