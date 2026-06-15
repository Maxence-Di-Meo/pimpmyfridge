import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../userPreferences/UserPreferences.css";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { intolerancesList, cuisineList, dietList } from "../userPreferences/ParameterList";
import { useSelector } from "react-redux";

function UserSettings() {
	const navigate = useNavigate();
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	let current_user = useSelector(state => state.userReducer.user);
	const userId = current_user.id;
	const [intolerances, setIntolerances] = useState([]);
	const [cuisines, setCuisines] = useState([]);
	const [diets, setDiets] = useState([]);
	const [excludeIngredients, setExcludeIngredients] = useState([]);
	const [excludeIngredientsInput, setExcludeIngredientsInput] = useState("");
	const [maxReadyTime, setMaxReadyTime] = useState("");
	const [servings, setServings] = useState("");

	const fetchUserPreferences = useCallback(async () => {
		const response = await fetch(`${PREFIX_BACKEND}/api/users/preferences/${userId}`);
		if (response.ok) {
			const data = await response.json();
			setIntolerances(data.intolerances);
			setCuisines(data.cuisines);
			setDiets(data.diets);
			setExcludeIngredients(data.excludeIngredients);
			setMaxReadyTime(data.maxReadyTime);
			setServings(data.servings);
		} else {
			console.error("Erreur lors de la récupération des préférences :", response.statusText);
		}
	}, [PREFIX_BACKEND, userId]);

	const getStyles = (item, list) => {
		return list.includes(item) ? { backgroundColor: "#A9A9A9" } : null;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		const userPreferences = {
			userId,
			intolerances,
			cuisines,
			diets,
			excludeIngredients,
			maxReadyTime,
			servings,
		};
		const preferencesResponse = await fetch(`${PREFIX_BACKEND}/api/users/preferences`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...userPreferences }),
		});

		const preferencesData = await preferencesResponse.json();
		if (!preferencesResponse.ok) {
			console.error(preferencesData.message);
		} else {
			navigate("/");
		}
	};

	useEffect(() => {
		if (!current_user.id) {
			navigate("/");
		} else {
			fetchUserPreferences();
		}
	}, [current_user, navigate, fetchUserPreferences]);

	return (
		<div className="preferences-container">
			<h1 className="form-title">T'as encore changé d'avis ?</h1>

			{/* Section préférences repas */}
			<div className="preference-section">
				<form onSubmit={handleSubmit}>
					{/* Intolérances alimentaires */}
					<div className="form-group">
						<label className="form-label">
							🚫 Y a-t-il des aliments qui te jouent des tours ?
						</label>
						<Select
							multiple
							value={intolerances}
							onChange={e => setIntolerances(e.target.value)}
							sx={{ background: "white", width: "100%" }}
						>
							{intolerancesList.map(intolerance => (
								<MenuItem
									key={intolerance.value}
									value={intolerance.value}
									style={getStyles(intolerance.value, intolerances)}
								>
									{intolerance.label}
								</MenuItem>
							))}
						</Select>
					</div>

					{/* Préférence pour certaines cuisines */}
					<div className="form-group">
						<label className="form-label">
							🌍Un tour du monde dans l'assiette ? Quelle(s) cuisine(s) fais-tu
							voyager dans ta cuisine ?
						</label>
						<Select
							multiple
							value={cuisines}
							onChange={e => setCuisines(e.target.value)}
							sx={{ background: "white", width: "100%" }}
							MenuProps={{
								PaperProps: { style: { maxHeight: 400, overflowY: "auto" } },
							}}
						>
							{cuisineList.map(cuisine => (
								<MenuItem
									key={cuisine.value}
									value={cuisine.value}
									style={getStyles(cuisine.value, cuisines)}
								>
									{cuisine.label}
								</MenuItem>
							))}
						</Select>
					</div>

					{/* Choix du type de régime */}
					<div className="form-group">
						<label className="form-label">
							🥗Un régime spécial ? (Végétarien, vegan... ou libre comme l'air ?)
						</label>
						<Select
							value={diets}
							onChange={e => setDiets(e.target.value)}
							sx={{ background: "white", width: "100%" }}
						>
							{dietList.map(diet => (
								<MenuItem
									key={diet.value}
									value={diet.value}
									style={getStyles(diet.value, diets)}
								>
									{diet.label}
								</MenuItem>
							))}
						</Select>
					</div>

					{/* Allergies alimentaires et restrictions alimentaires */}
					<div className="form-group">
						<label className="form-label">
							⚠️ Des ingrédients à bannir de tes recettes ?
						</label>
						<input
							type="text"
							value={excludeIngredientsInput}
							onChange={e => setExcludeIngredientsInput(e.target.value.toLowerCase())}
							onKeyDown={e => {
								if (e.key === "Enter" && excludeIngredientsInput) {
									setExcludeIngredients([
										...excludeIngredients,
										excludeIngredientsInput,
									]);
									setExcludeIngredientsInput("");
								}
							}}
							placeholder={
								excludeIngredients.length !== 0
									? excludeIngredients
									: "Ex: Poisson, Carotte, Lait, etc."
							}
							className="form-input"
						/>
					</div>

					{/* Temps maximal de préparation */}
					<div className="form-group">
						<label className="form-label">
							⏱️ Combien de temps es-tu prêt(e) à accorder à ton festin ? (en minutes)
						</label>
						<input
							type="number"
							value={maxReadyTime}
							onChange={e => setMaxReadyTime(e.target.value)}
							placeholder="Ex: 30"
							className="form-input"
						/>
					</div>

					{/* Nombre de portions */}
					<div className="form-group">
						<label className="form-label">🍴 Combien de gourmands à régaler ?</label>
						<input
							type="number"
							value={servings}
							onChange={e => setServings(e.target.value)}
							placeholder="Ex: 4"
							required
							className="form-input"
						/>
					</div>

					{/* Soumettre le formulaire */}
					<div className="form-group">
						<button type="submit" className="submit-button">
							Soumettre mes nouvelles préférences
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default UserSettings;
