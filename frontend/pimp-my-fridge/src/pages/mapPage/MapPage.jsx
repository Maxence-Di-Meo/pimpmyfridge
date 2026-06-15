import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerSupermarket from "../../assets/supermarket.png";
import banner from "../../assets/banner.png";
import IngredientList from "../../components/ingredientList/IngredientList";
import { useSelector } from "react-redux";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

const customSupermarketIcon = new L.Icon({
	iconUrl: markerSupermarket,
	iconSize: [30, 40],
	iconAnchor: [15, 40],
	popupAnchor: [0, -40],
});

const customUserIcon = new L.Icon({
	iconUrl: markerIcon,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl: markerShadow,
});

function MapPage() {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	// Récupérer l'utilisateur connecté
	const currentUser = useSelector(state => state.userReducer.user);
	const userId = currentUser?.id;

	const [position, setPosition] = useState(null);
	const [supermarkets, setSupermarkets] = useState([]);
	const [ingredients, setIngredients] = useState(null);

	// Fonction pour nettoyer et fusionner les ingrédients
	const cleanIngredients = rawIngredients => {
		const cleanedIngredients = {};

		Object.keys(rawIngredients).forEach(key => {
			const value = rawIngredients[key];

			if (Array.isArray(value)) {
				value.forEach(item => {
					if (!cleanedIngredients[key]) {
						cleanedIngredients[key] = [];
					}
					cleanedIngredients[key].push(item);
				});
			} else {
				if (!cleanedIngredients[key]) {
					cleanedIngredients[key] = [];
				}
				cleanedIngredients[key].push(value);
			}
		});

		const mergedIngredients = {};

		Object.keys(cleanedIngredients).forEach(key => {
			const items = cleanedIngredients[key];
			const mergedItem = items.reduce(
				(acc, item) => {
					if (item.unit === acc.unit || !acc.unit) {
						acc.amount += item.amount;
						acc.unit = item.unit;
					} else {
						if (!acc.differentUnits) {
							acc.differentUnits = [];
						}
						acc.differentUnits.push(item);
					}
					return acc;
				},
				{ amount: 0, unit: null }
			);

			mergedIngredients[key] = mergedItem;
		});

		return mergedIngredients;
	};

	// Fonction pour récupérer les ingrédients de l'utilisateur
	const fetchIngredients = useCallback(async () => {
		if (!userId) return;

		try {
			const response = await fetch(`${PREFIX_BACKEND}/api/listingredients/${userId}`);
			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des ingrédients");
			}
			const data = await response.json();
			const shoppingList = data.shoppingLists[0]; // Prend la première liste (ou adaptez si nécessaire)
			if (shoppingList && shoppingList.listingredients) {
				const cleanedIngredients = cleanIngredients(shoppingList.listingredients);
				setIngredients(cleanedIngredients);
			} else {
				setIngredients({});
			}
		} catch (error) {
			console.error("Erreur lors de la récupération des ingrédients :", error);
			setIngredients({});
		}
	}, [userId, PREFIX_BACKEND]);

	const fetchNearbySupermarkets = useCallback(
		async (latitude, longitude) => {
			try {
				const response = await fetch(
					`${PREFIX_BACKEND}/api/geolocation/nearby-supermarkets?latitude=${latitude}&longitude=${longitude}`
				);
				const data = await response.json();
				setSupermarkets(data.results);
			} catch (error) {
				console.error("Erreur lors de la récupération des supermarchés :", error);
			}
		},
		[PREFIX_BACKEND]
	);

	const fetchPositionFromGoogle = useCallback(async () => {
		try {
			const response = await fetch(`${PREFIX_BACKEND}/api/geolocation/geolocate`, {
				method: "POST",
			});
			const data = await response.json();
			const { lat, lng } = data.location;
			setPosition([lat, lng]);
			fetchNearbySupermarkets(lat, lng);
		} catch (error) {
			console.error("Erreur lors de l'accès à la position via Google :", error);
		}
	}, [fetchNearbySupermarkets, PREFIX_BACKEND]);

	useEffect(() => {
		// Récupération des ingrédients lorsque l'userId est disponible
		if (userId) {
			fetchIngredients();
		}
	}, [userId, fetchIngredients]);

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				pos => {
					const { latitude, longitude, accuracy } = pos.coords;
					setPosition([latitude, longitude]);
					if (accuracy > 50) {
						fetchPositionFromGoogle();
					} else {
						fetchNearbySupermarkets(latitude, longitude);
					}
				},
				error => {
					console.error("Erreur lors de l'accès à la position :", error);
					fetchPositionFromGoogle();
				},
				{ enableHighAccuracy: true }
			);
		} else {
			fetchPositionFromGoogle();
		}
	}, [fetchPositionFromGoogle, fetchNearbySupermarkets]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				margin: "20px",
				gap: "20px",
			}}
		>
			{position ? (
				<>
					<img src={banner} alt="banner" style={{ width: "20%", borderRadius: "10px" }} />
					<MapContainer
						center={position}
						zoom={13}
						style={{ height: "80vh", width: "60%" }}
					>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						/>
						<Marker position={position} icon={customUserIcon}>
							<Popup>Vous êtes ici</Popup>
						</Marker>

						{supermarkets.map((supermarket, index) => (
							<Marker
								key={index}
								position={[
									supermarket.geometry.location.lat,
									supermarket.geometry.location.lng,
								]}
								icon={customSupermarketIcon}
							>
								<Popup>
									<strong>{supermarket.name}</strong>
									<br />
									{supermarket.vicinity}
									<br />
									{supermarket.co2Emissions.toFixed(2)} kg CO2
								</Popup>
							</Marker>
						))}
					</MapContainer>
					<div
						style={{
							width: "20%",
							margin: "20px",
							backgroundColor: "#ffa07a",
							borderRadius: "10px",
							paddingLeft: "20px",
						}}
					>
						<h3>Liste de courses</h3>
						{ingredients && Object.keys(ingredients).length > 0 ? (
							<IngredientList ingredients={ingredients} />
						) : (
							<p>Aucune liste d'ingrédients disponible.</p>
						)}
					</div>
				</>
			) : (
				<p>Chargement de la position...</p>
			)}
		</div>
	);
}

export default MapPage;
