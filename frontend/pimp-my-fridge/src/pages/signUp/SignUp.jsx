import React, { useState } from "react";
import "../../components/authmodal/AuthModal.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { update_user } from "../../slices/userSlice";
import "../../components/authmodal/AuthModal.css";
import LocationCheckbox from "../../components/locationCheckbox/LocationCheckbox";

function SignUp({ toggleModal }) {
	const PREFIX_BACKEND = process.env.REACT_APP_PREFIX_BACKEND;
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async e => {
		e.preventDefault();
		const response = await fetch(`${PREFIX_BACKEND}/api/users/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, email, password }),
		});
		await response.json();
		if (!response.ok) {
			setError("Cet email est déjà utilisé");
		} else {
			const login = await fetch(`${PREFIX_BACKEND}/api/users/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});
			const loginData = await login.json();
			if (!login.ok) {
				console.error("Erreur de connexion:", loginData.message);
			} else {
				localStorage.setItem("tokenPimpMyFridge", loginData.token);
				dispatch(update_user({ user: loginData.user }));
				toggleModal();
				navigate("/recipe");
			}
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h2>Inscription</h2>
				<form onSubmit={handleSubmit}>
					<label>
						Username
						<input
							type="username"
							value={username}
							onChange={e => setUsername(e.target.value)}
							required
						/>
					</label>
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
					<button type="submit">S'inscrire</button>
				</form>
				{error && <p className="error">{error}</p>}
				<button onClick={toggleModal} className="close-modal">
					Fermer
				</button>
			</div>
		</div>
	);
}

export default SignUp;
