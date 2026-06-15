import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./MealPlanner.css";
import { useSelector } from "react-redux";

const MealPlanner = () => {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const [weeklyRecipes, setWeeklyRecipes] = useState([]); // Les recettes pour la semaine
	const [suggestions, setSuggestions] = useState([]); // Suggestions de nouvelles recettes
	const [isSuggestionModalOpen, setSuggestionModalOpen] = useState(false); // Modal
	const [isSaturday, setIsSaturday] = useState(true); // Indique si c'est samedi
	//const userID = 1; // ID de l'utilisateur actuel
	const currentUser = useSelector(state => state.userReducer.user);
	const userID = currentUser?.id;

	const [isModalOpen, setIsModalOpen] = useState(false);

	//// ==================== DEBUG ====================
	//const [confirmedRecipesList, setConfirmedRecipesList] = useState([]); 			// Liste des recettes confirmées pour DEBUG
	//const [confirmedRecipes] = useState({}); // Recettes confirmées
	//const [rejectedRecipe, setRejectedRecipe] = useState([]); 						// Recettes rejetées
	//const [selectedRecipe, setSelectedRecipe] = useState(null); // Recette sélectionnée

	// Charge les recettes initiales
	useEffect(() => {
		let isMounted = true;

		const today = new Date(/*"2025-01-25T00:00:00"*/); // 25 janvier 2025 est un samedi
		setIsSaturday(today.getDay() === 6);

		const clearRedisCache = async () => {
			try {
				const response = await fetch(
					`${PREFIX_BACKEND}/api/meal/clear-cache?userID=${userID}`,
					{
						method: "DELETE",
					}
				);
				if (!response.ok) {
					throw new Error("Erreur lors du nettoyage du cache Redis.");
				}
				console.log("Cache Redis vidé avec succès.");
			} catch (error) {
				console.error("Erreur lors du nettoyage du cache Redis :", error);
			}
		};

		const fetchRecipes = async () => {
			try {
				const response = await fetch(`${PREFIX_BACKEND}/api/meal?userID=${userID}`);
				if (!response.ok) {
					throw new Error("Erreur lors du fetch des recettes.");
				}
				const data = await response.json();

				if (isMounted) {
					console.log("Données reçues du backend :", data);

					if (data.isValidated) {
						// Gestion des recettes validées
						const validatedRecipes = data.recipes.map(recipe => {
							const localDate = new Date(
								new Date(recipe.datedue).getTime() -
									new Date(recipe.datedue).getTimezoneOffset() * 60000
							)
								.toISOString()
								.split("T")[0]; // Convertir en date locale sans décalage

							return {
								title: recipe.name,
								start: localDate,
								extendedProps: {
									id: recipe.recipeid,
									image: recipe.image,
									isValidated: true, // Marque comme validée
								},
							};
						});
						setWeeklyRecipes(validatedRecipes);
					} else {
						// Gestion des recettes non validées
						console.log("Pas de recettes validées. Redis sera utilisé.");

						const currentDay = today.getDay();
						const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
						const totalDays = daysUntilSunday + 1;
						const totalMeals = totalDays * 3;

						const limitedRecipes = data.recipes.slice(0, totalMeals);
						const recipesWithDates = limitedRecipes.map((recipe, index) => {
							const mealDay = new Date(today);
							mealDay.setDate(today.getDate() + Math.floor(index / 3));

							const localDate = new Date(
								mealDay.getTime() - mealDay.getTimezoneOffset() * 60000
							)
								.toISOString()
								.split("T")[0]; // Convertir en date locale sans décalage

							const mealType =
								index % 3 === 0 ? "morning" : index % 3 === 1 ? "noon" : "evening";

							return {
								title: recipe.name,
								start: localDate,
								extendedProps: {
									id: recipe.recipeid,
									mealType: mealType,
									image: recipe.image,
									isValidated: false, // Marque comme non validée
								},
							};
						});

						setWeeklyRecipes(recipesWithDates);
					}
				}
			} catch (error) {
				console.error("Erreur lors du fetch des recettes :", error);
			}
		};

		// Nettoyer le cache Redis et charger les recettes
		clearRedisCache();
		fetchRecipes();

		return () => {
			isMounted = false;
		};
	}, [userID, PREFIX_BACKEND]);

	const rejectRecipe = recipe => {
		console.log("Données reçues pour le rejet :", recipe);

		if (!recipe || !recipe.id || !recipe.date || !recipe.mealType) {
			alert("Erreur : données invalides pour la recette.");
			return;
		}

		fetch(`${PREFIX_BACKEND}/api/meal/reject`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				recipeID: recipe.id,
				date: recipe.date,
				mealType: recipe.mealType,
				userID,
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("Erreur lors du rejet de la recette.");
				}
				return response.json();
			})
			.then(data => {
				console.log("Suggestions reçues :", data.suggestions);
				setSuggestions(data.suggestions);
				setSuggestionModalOpen(true);
			})
			.catch(error => {
				console.error("Erreur lors du rejet :", error);
				alert("Impossible de générer des suggestions pour le moment.");
			});
	};

	const SuggestionModal = ({ suggestions = [], onSelect, onClose }) => {
		if (!suggestions || suggestions.length === 0) {
			return (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1000,
					}}
				>
					<div
						style={{
							backgroundColor: "white",
							borderRadius: "8px",
							width: "50%",
							padding: "20px",
							boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
						}}
					>
						<h2 style={{ textAlign: "center" }}>Aucune suggestion disponible</h2>
						<button
							onClick={onClose}
							style={{
								display: "block",
								margin: "20px auto 0",
								padding: "10px 15px",
								backgroundColor: "#FF4D4D",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
						>
							Fermer
						</button>
					</div>
				</div>
			);
		}

		return (
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					zIndex: 1000,
				}}
			>
				<div
					style={{
						backgroundColor: "white",
						borderRadius: "8px",
						width: "50%",
						padding: "20px",
						boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
					}}
				>
					<h2 style={{ textAlign: "center" }}>Choose a Replacement Meal</h2>
					<ul style={{ listStyleType: "none", padding: 0 }}>
						{suggestions.map(suggestion => (
							<li
								key={suggestion.id}
								style={{
									marginBottom: "15px",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<div style={{ flex: 1, display: "flex", alignItems: "center" }}>
									<img
										src={suggestion.image}
										alt={suggestion.title}
										style={{
											width: "100px",
											height: "auto",
											marginRight: "10px",
										}}
									/>
									<div>
										<h3>{suggestion.title}</h3>
									</div>
								</div>
								<button
									style={{
										padding: "10px 15px",
										backgroundColor: "#007BFF",
										color: "white",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
									}}
									onClick={() => onSelect(suggestion)}
								>
									Select
								</button>
							</li>
						))}
					</ul>
					<button
						onClick={onClose}
						style={{
							display: "block",
							margin: "20px auto 0",
							padding: "10px 15px",
							backgroundColor: "#FF4D4D",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Close
					</button>
				</div>
			</div>
		);
	};

	const handleSelectSuggestion = selected => {
		if (!selected.mealType) {
			console.error("Selected suggestion does not have a mealType:", selected);
			alert("Error: Selected meal does not have a meal type.");
			return; // Exit the function if mealType is missing
		}

		setSuggestionModalOpen(false); // Close the modal

		// Add the selected recipe to weekly recipes
		setWeeklyRecipes(prev =>
			prev.map(recipe =>
				recipe.extendedProps.id === selected.rejectedRecipeId // Identifiez la recette rejetée par son ID
					? {
							id: selected.id,
							title: `${selected.mealType.toUpperCase()}: ${selected.title}`,
							start: selected.date,
							extendedProps: {
								id: selected.id,
								mealType: selected.mealType,
								image: selected.image,
								instructions: selected.instructions?.join(" ") || "",
								ingredients: selected.ingredients || [],
							},
						}
					: recipe
			)
		);
		console.log("Replacement meal added:", selected);
	};

	const confirmAllRecipes = () => {
		// Filtrer les recettes non validées
		const recipesToSave = weeklyRecipes
			.filter(recipe => !recipe.extendedProps.isValidated) // Ne prendre que celles qui ne sont pas validées
			.map(recipe => ({
				userid: userID, // ID utilisateur actuel
				recipeid: recipe.extendedProps.id, // ID de la recette
				datedue: recipe.start, // Date associée au repas
			}));

		// Vérification qu'il n'y a pas d'erreur dans les données
		if (recipesToSave.length === 0) {
			alert("Toutes les recettes sont déjà validées ou aucune recette à confirmer.");
			return;
		}

		if (recipesToSave.some(recipe => !recipe.recipeid || !recipe.datedue)) {
			alert("Certaines recettes manquent d'informations nécessaires.");
			console.error("Données invalides :", recipesToSave);
			return;
		}

		console.log("Données envoyées au backend pour confirmation :", recipesToSave);

		// Envoyer les données au backend
		fetch(`${PREFIX_BACKEND}/api/meal/confirm`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ recipes: recipesToSave }),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("Erreur lors de la confirmation des recettes.");
				}
				return response.json();
			})
			.then(data => {
				console.log("Confirmation réussie :", data);
				alert("Toutes les recettes non validées ont été confirmées avec succès !");
				// Marquer les recettes comme validées
				setWeeklyRecipes(prev =>
					prev.map(recipe =>
						!recipe.extendedProps.isValidated // Marquer seulement celles non validées
							? {
									...recipe,
									extendedProps: { ...recipe.extendedProps, isValidated: true },
								}
							: recipe
					)
				);
			})
			.catch(error => {
				console.error("Erreur lors de la confirmation :", error);
				alert("Erreur interne lors de la confirmation.");
			});
	};

	const fetchNextWeekRecipes = () => {
		fetch(`${PREFIX_BACKEND}/api/meal/next-week?userID=${userID}`)
			.then(response => {
				if (!response.ok) {
					throw new Error(
						"Erreur lors de la récupération des recettes de la semaine suivante."
					);
				}
				return response.json();
			})
			.then(data => {
				console.log("Recettes de la semaine suivante récupérées :", data);
				// Vérifiez ici que les dates et les recettes correspondent bien à la semaine suivante
				const nextWeekRecipes = data.recipes.map(recipe => ({
					title: recipe.name,
					start: recipe.datedue,
					extendedProps: {
						id: recipe.recipeid,
						image: recipe.image,
						isValidated: recipe.isValidated || false, // Pas encore validée
					},
				}));

				setWeeklyRecipes(prevRecipes => [...prevRecipes, ...nextWeekRecipes]);
			})
			.catch(error => {
				console.error("Erreur :", error);
				alert("Impossible de récupérer les recettes de la semaine suivante.");
			});
	};

	// Appeler cette fonction après avoir généré les recettes de la semaine suivante
	const generateNextWeekRecipes = () => {
		fetch(`${PREFIX_BACKEND}/api/meal/next-week?userID=${userID}`, {
			method: "POST",
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(
						"Erreur lors de la génération des recettes pour la semaine suivante."
					);
				}
				return response.json();
			})
			.then(data => {
				console.log("Recettes de la semaine suivante générées :", data);
				alert("Recettes de la semaine suivante générées. Veuillez les valider.");
				// Appeler la fonction pour récupérer et afficher les recettes
				fetchNextWeekRecipes();
				setIsModalOpen(false); // Fermer la modal
			})
			.catch(error => {
				console.error("Erreur :", error);
				alert("Erreur lors de la génération des recettes.");
			});
	};

	const openConfirmationModal = () => {
		setIsModalOpen(true);
	};

	const ConfirmationModal = ({ onConfirm, onClose }) => {
		return (
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					zIndex: 1000,
				}}
			>
				<div
					style={{
						backgroundColor: "white",
						borderRadius: "8px",
						width: "50%",
						padding: "20px",
						boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
					}}
				>
					<h2>Confirmer la génération des recettes</h2>
					<p>Voulez-vous générer les recettes pour la semaine suivante ?</p>
					<div
						style={{
							display: "flex",
							justifyContent: "space-around",
							marginTop: "20px",
						}}
					>
						<button
							style={{
								padding: "10px 15px",
								backgroundColor: "#007BFF",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
							onClick={onConfirm}
						>
							Confirmer
						</button>
						<button
							style={{
								padding: "10px 15px",
								backgroundColor: "#FF4D4D",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
							onClick={onClose}
						>
							Annuler
						</button>
					</div>
				</div>
			</div>
		);
	};

	// const handleGenerateNextWeekRecipes = () => {
	// 	fetch(`${PREFIX_BACKEND}/api/meal/next-week?userID=${userID}`, {
	// 		method: "POST",
	// 	})
	// 		.then(response => {
	// 			if (!response.ok) {
	// 				throw new Error(
	// 					"Erreur lors de la génération des recettes de la semaine suivante."
	// 				);
	// 			}
	// 			return response.json();
	// 		})
	// 		.then(data => {
	// 			console.log("Recettes générées pour la semaine suivante :", data);
	// 			alert("Les recettes de la semaine suivante ont été générées !");
	// 		})
	// 		.catch(error => {
	// 			console.error("Erreur :", error);
	// 			alert("Impossible de générer les recettes.");
	// 		});
	// };

	return (
		<div className="explore-page" style={{ position: "relative" }}>
			<h1>Meal Planner Hebdomadaire</h1>
			<FullCalendar
				plugins={[dayGridPlugin, interactionPlugin]}
				initialView="dayGridWeek"
				initialDate="2025-01-25"
				firstDay={1}
				headerToolbar={{
					left: "prev,next",
					center: "title",
					right: "",
				}}
				height="870px"
				events={weeklyRecipes}
				eventContent={eventInfo => {
					const { id, mealType, image, isValidated /*, ingredients*/ } =
						eventInfo.event.extendedProps;
					const date = eventInfo.event.startStr;

					return (
						<div className="recipe-card">
							<img src={image} alt={eventInfo.event.title} className="recipe-image" />
							<div className="recipe-title">{eventInfo.event.title}</div>
							{!isValidated && (
								<button
									onClick={() =>
										rejectRecipe({
											id,
											date,
											mealType,
										})
									}
								>
									Rejeter
								</button>
							)}
							{/* <button onClick={() => confirmRecipe(eventInfo.event.extendedProps.id)}>
								Valider
							</button> */}
						</div>
					);
				}}
			/>
			{isSuggestionModalOpen && (
				<SuggestionModal
					suggestions={suggestions}
					onSelect={handleSelectSuggestion}
					onClose={() => setSuggestionModalOpen(false)}
				/>
			)}
			{weeklyRecipes.some(recipe => !recipe.extendedProps.isValidated) && (
				<button className="confirm-all-btn" onClick={confirmAllRecipes}>
					Parfait ! On valide le planner !
				</button>
			)}

			{isSaturday && (
				<>
					<button
						className="generate-next-week-btn"
						onClick={openConfirmationModal}
						style={{
							display: "block",
							margin: "20px auto",
							padding: "10px 15px",
							backgroundColor: "green",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Générer les recettes de la semaine suivante
					</button>

					{isModalOpen && (
						<ConfirmationModal
							onConfirm={generateNextWeekRecipes}
							onClose={() => setIsModalOpen(false)}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default MealPlanner;
