import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserPreferences.css";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Autocomplete, TextField } from "@mui/material";
import { intolerancesList, cuisineList, dietList, excludeIngredientsList } from "./ParameterList";
import { useDispatch, useSelector } from "react-redux";
import { update_user } from "../../slices/userSlice";

function UserPreferences() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	let current_user = useSelector(state => state.userReducer.user);
	const userId = current_user.id;
	const [intolerances, setIntolerances] = useState([]);
	const [cuisines, setCuisines] = useState([]);
	const [diets, setDiets] = useState([]);
	const [excludeIngredients, setExcludeIngredients] = useState([]);
	const [maxReadyTime, setMaxReadyTime] = useState("");
	const [servings, setServings] = useState("");

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
		console.log("userPreferences", userPreferences);
		const preferencesResponse = await fetch(`${PREFIX_BACKEND}/api/users/preferences`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...userPreferences }),
		});

		const preferencesData = await preferencesResponse.json();
		if (!preferencesResponse.ok) {
			console.error(preferencesData.message);
		} else {
			const changeuser = { ...current_user, isFirstLogin: false };
			dispatch(update_user({ user: changeuser }));
			navigate("/");
		}
	};

	useEffect(() => {
		if (!current_user.id) {
			navigate("/");
		}
	}, [current_user, navigate]);

	return (
		<div className="preferences-container">
			<h1 className="form-title">Crée ton profil gourmand !</h1>

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
						<Autocomplete
							multiple
							id="exclude-ingredients"
							options={excludeIngredientsList}
							getOptionLabel={option => option.label}
							value={excludeIngredients}
							onChange={(_, newValue) => setExcludeIngredients(newValue)}
							sx={{ background: "white", width: "100%" }}
							renderInput={params => <TextField {...params} className="form-input" />}
							disableCloseOnSelect
							isOptionEqualToValue={(option, value) => option.value === value.value}
							PaperComponent={({ children }) => (
								<div style={{ maxHeight: 300, overflow: "auto" }}>{children}</div>
							)}
							PopperComponent={props => (
								<div
									{...props}
									style={{ width: "100%", maxHeight: 300, overflowY: "auto" }}
								/>
							)}
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
							Soumettre mes préférences
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default UserPreferences;
