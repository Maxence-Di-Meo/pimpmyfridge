import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { update_user_location } from "../../slices/userSlice";
import "./LocationCheckbox.css";

function LocationCheckbox() {
	const dispatch = useDispatch();
	const [isChecked, setIsChecked] = useState(false);

	const handleCheckboxChange = async e => {
		setIsChecked(e.target.checked);
		if (e.target.checked) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					position => {
						const { latitude, longitude } = position.coords;
						dispatch(update_user_location({ latitude, longitude }));
					},
					error => {
						console.error("Erreur lors de l'accès à la position :", error);
					}
				);
			} else {
				console.error("La géolocalisation n'est pas supportée par ce navigateur.");
			}
		}
	};

	return (
		<label className="location">
			<input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
			Autoriser l'accès à ma position
		</label>
	);
}

export default LocationCheckbox;
