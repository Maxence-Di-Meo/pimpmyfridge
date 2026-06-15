import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./Dashboard.css";
import Lottie from "lottie-react";
import { Tooltip } from "react-tooltip";
import ManAnimationData from "../../assets/Man.json";
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
} from "recharts";
import foodscoreMessages from "./foodscoreMessages.json";
import carbonImpactData from "./carbonImpact.json";

const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#FF6384",
	"#36A2EB",
	"#FFCE56",
	"#4BC0C0",
	"#9966FF",
	"#FF9F40",
];

const Animation = () => {
	return <Lottie animationData={ManAnimationData} />;
};

const Dashboard = () => {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const currentUser = useSelector(state => state.userReducer.user);
	const userId = currentUser?.id;

	const [foodscore, setFoodscore] = useState(null);
	const [advice, setAdvice] = useState([]);
	const [observations, setObservations] = useState([]);
	const [carbonImpact, setCarbonImpact] = useState([]);
	const [totalCO2, setTotalCO2] = useState(0);
	const [nutritionData, setNutritionData] = useState([]);
	const [averageNutrients, setAverageNutrients] = useState([]);
	const [averageCaloricBreakdown, setAverageCaloricBreakdown] = useState({});
	const [flavonoids, setFlavonoids] = useState([]);
	const [averageNutritionScore, setAverageNutritionScore] = useState(0);

	useEffect(() => {
		const fetchNutritionData = async () => {
			if (!userId) return;
			try {
				const response = await fetch(`${PREFIX_BACKEND}/api/nutrition/${userId}`);
				const data = await response.json();

				if (data.recipes) {
					setNutritionData(data.recipes);

					// Calculate average nutrients
					const nutrientSums = {};
					const nutrientCounts = {};
					data.recipes.forEach(recipe => {
						recipe.nutritionSummary.nutrient.forEach(nutrient => {
							if (!nutrientSums[nutrient.name]) {
								nutrientSums[nutrient.name] = 0;
								nutrientCounts[nutrient.name] = 0;
							}
							nutrientSums[nutrient.name] += nutrient.amount;
							nutrientCounts[nutrient.name] += 1;
						});
					});
					const averageNutrients = Object.keys(nutrientSums).map(name => ({
						name,
						amount: nutrientSums[name] / nutrientCounts[name],
					}));
					setAverageNutrients(averageNutrients);

					// Calculate average caloric breakdown
					const caloricSums = { percentFat: 0, percentCarbs: 0, percentProtein: 0 };
					data.recipes.forEach(recipe => {
						const breakdown = recipe.nutritionSummary.caloric_breakdown;
						caloricSums.percentFat += breakdown.percentFat;
						caloricSums.percentCarbs += breakdown.percentCarbs;
						caloricSums.percentProtein += breakdown.percentProtein;
					});
					const averageCaloricBreakdown = {
						percentFat: caloricSums.percentFat / data.recipes.length,
						percentCarbs: caloricSums.percentCarbs / data.recipes.length,
						percentProtein: caloricSums.percentProtein / data.recipes.length,
					};
					setAverageCaloricBreakdown(averageCaloricBreakdown);

					// Set flavonoids data
					const flavonoidsData = data.recipes.flatMap(
						recipe => recipe.nutritionSummary.flavonoids
					);
					setFlavonoids(flavonoidsData);

					// Calculate average nutrition score
					const totalNutritionScore = data.recipes.reduce((sum, recipe) => {
						const score =
							recipe.nutritionSummary.properties.find(
								prop => prop.name === "Nutrition Score"
							)?.amount || 0;
						return sum + score;
					}, 0);
					const averageScore = totalNutritionScore / data.recipes.length;
					setAverageNutritionScore(averageScore);
					setFoodscore(averageScore); // Set the foodscore to the average nutrition score
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des données nutritionnelles :",
					error
				);
			}
		};

		fetchNutritionData();
	}, [userId, PREFIX_BACKEND]);

	useEffect(() => {
		const fetchCarbonImpactData = async () => {
			if (!userId) return;
			try {
				const response = await fetch(`${PREFIX_BACKEND}/api/listingredients/${userId}`);
				const data = await response.json();

				if (data.shoppingLists && data.shoppingLists.length > 0) {
					const summary = data.shoppingLists[0].nutrition_summary.summary;
					const carbonImpactApiData = data.shoppingLists[0].carbon_impact;

					setAdvice(summary.advice);
					setObservations(summary.observations);

					const categoryMapping = {
						"Red meat": "Red meat",
						"White meat": "White meat",
						"Fish/crustaceans": "Fish/crustaceans",
						"Farmed shrimp": "Farmed shrimp",
						"Seasonal fruits or vegetables": "Seasonal fruits or vegetables",
						"Exotic fruits or vegetables": "Fruits or vegetables (Exotic)",
						"Cheese/dairy/eggs": "Cheese/dairy/eggs",
						"Pasta/rice": "Pasta/rice",
						"Wine/beer": "Wine/beer",
						"Juice/soda/water": "Juice/soda/water",
					};

					const mergedCarbonImpact = Object.keys(carbonImpactData.categories).reduce(
						(acc, key) => {
							const apiKey = categoryMapping[key];
							const totalAmount = carbonImpactApiData[apiKey]?.totalAmount || 0;
							const co2PerKg = carbonImpactData.categories[key] || 0;
							acc.push({
								name: key,
								totalAmount,
								co2: totalAmount * co2PerKg,
							});
							return acc;
						},
						[]
					);

					setCarbonImpact(mergedCarbonImpact);

					const totalCO2 = mergedCarbonImpact.reduce((sum, item) => sum + item.co2, 0);
					setTotalCO2(totalCO2);
				}
			} catch (error) {
				console.error("Erreur lors de la récupération des données :", error);
			}
		};

		fetchCarbonImpactData();
	}, [userId, PREFIX_BACKEND]);

	const getTooltipContent = () => {
		if (foodscore === null) return "Chargement des données...";

		const messages = foodscoreMessages.find(
			item => foodscore >= item.min && foodscore <= item.max
		)?.messages;

		if (messages) {
			return messages[Math.floor(Math.random() * messages.length)];
		} else {
			return "Pas de données disponibles pour ce score.";
		}
	};

	return (
		<div>
			<h1 className="dashboard-title">Ton récap hebdomadaire</h1>
			<div className="dashboard-container">
				<div className="dashboard-section" id="sante">
					<h2 className="section-title">SANTÉ</h2>
					<h3>Conseils nutritionnels</h3>
					<ul className="advice-list">
						{advice.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>
					<h3>Observations générales</h3>
					<ul className="observations-list">
						{observations.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>
					<h3>
						Score nutritionnel des recettes (Moyenne: {averageNutritionScore.toFixed(2)}
						%)
					</h3>
					<BarChart
						width={600}
						height={300}
						data={nutritionData.map(recipe => ({
							name: recipe.name,
							score:
								recipe.nutritionSummary.properties.find(
									prop => prop.name === "Nutrition Score"
								)?.amount || 0,
						}))}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<RechartsTooltip />
						<Legend />
						<Bar dataKey="score" fill="#8884d8" />
					</BarChart>
					<h3>Moyenne des Nutriments</h3>
					<BarChart width={600} height={300} data={averageNutrients}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<RechartsTooltip />
						<Legend />
						<Bar dataKey="amount" fill="#82ca9d" />
					</BarChart>
					<h3>Répartition Calorique Moyenne</h3>
					<PieChart width={400} height={400}>
						<Pie
							data={[
								{ name: "Fat", value: averageCaloricBreakdown.percentFat },
								{ name: "Carbs", value: averageCaloricBreakdown.percentCarbs },
								{ name: "Protein", value: averageCaloricBreakdown.percentProtein },
							]}
							cx={200}
							cy={200}
							labelLine={false}
							label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
						>
							{COLORS.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<RechartsTooltip />
						<Legend />
					</PieChart>
					<h3>Flavonoïdes</h3>
					<BarChart width={600} height={300} data={flavonoids}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<RechartsTooltip />
						<Legend />
						<Bar dataKey="amount" fill="#ffc658" />
					</BarChart>
				</div>

				<div className="dashboard-section" id="bilan-carbone">
					<h2 className="section-title">BILAN CARBONE</h2>
					<h3>Impact carbone de votre alimentation</h3>
					<BarChart width={600} height={300} data={carbonImpact}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<RechartsTooltip />
						<Legend />
						<Bar dataKey="co2" fill="#82ca9d" />
					</BarChart>
					<p className="total-co2">
						<strong>Total carbone : {totalCO2.toFixed(2)} kg CO₂</strong>
					</p>
				</div>

				<div className="animation-container" data-tooltip-id="my-tooltip">
					<Animation />
					<Tooltip
						id="my-tooltip"
						className="custom-tooltip"
						place="top-start"
						content={getTooltipContent()}
						style={{
							fontSize: "18px",
							maxWidth: "400px",
							padding: "20px",
							marginBottom: "-50px",
							backgroundColor: "#fff",
							color: "#333",
							border: "2px solid orange",
							borderRadius: "15px",
							boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
							fontWeight: "bold",
							textAlign: "center",
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
