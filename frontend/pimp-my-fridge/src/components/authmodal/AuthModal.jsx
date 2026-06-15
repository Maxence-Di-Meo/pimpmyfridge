import React, { useState } from "react";
import "./AuthModal.css";
import { useDispatch } from "react-redux";
import { update_user } from "../../slices/userSlice";
import LocationCheckbox from "../locationCheckbox/LocationCheckbox";

function AuthModal({ toggleModal }) {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const dispatch = useDispatch();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async e => {
		e.preventDefault();
		console.log("submit", PREFIX_BACKEND);
		const login = await fetch(`${PREFIX_BACKEND}/api/users/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});
		const loginData = await login.json();
		if (!login.ok) {
			setError("Email ou mot de passe incorrect");
		} else {
			localStorage.setItem("tokenPimpMyFridge", loginData.token);
			dispatch(update_user({ user: loginData.user }));
			toggleModal();
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h2>Connexion</h2>
				<form onSubmit={handleSubmit}>
					<label>
						Email
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
						/>
					</label>
					<label>
						Mot de passe
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
						/>
					</label>
					<LocationCheckbox />
					<button type="submit">Se connecter</button>
					{error && <p className="error">{error}</p>}
				</form>
				<button onClick={toggleModal} className="close-modal">
					Fermer
				</button>
			</div>
		</div>
	);
}

export default AuthModal;
