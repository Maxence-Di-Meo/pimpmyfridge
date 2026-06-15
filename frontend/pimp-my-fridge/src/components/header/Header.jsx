import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthModal from "../authmodal/AuthModal";
import SignUp from "../../pages/signUp/SignUp";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { update_user } from "../../slices/userSlice";
import { useNavigate } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import "./Header.css";

function Header() {
	const url = window.location.pathname;
	const navigate = useNavigate();
	const dispatch = useDispatch();

	let current_user = useSelector(state => state.userReducer.user);
	const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
	const [isModalSignupOpen, setIsModalSignupOpen] = useState(false);

	const toggleModalLogin = () => {
		setIsModalLoginOpen(!isModalLoginOpen);
	};

	const toggleModalSignup = () => {
		setIsModalSignupOpen(!isModalSignupOpen);
	};

	const logout = () => {
		localStorage.removeItem("tokenPimpMyFridge");
		dispatch(update_user({ user: {} }));
		navigate("/");
	};

	const settings = () => {
		navigate("/settings");
	};

	useEffect(() => {
		if (!current_user.id && url !== "/" && url !== "/recipe") {
			navigate("/");
		}
	}, [current_user, url, navigate]);

	return (
		<nav className="header">
			{/* Conteneur pour le logo et le lien Recipes à gauche */}
			<div className="left-container">
				<div className="logo">
					<Link to="/" className="logo-link">
						Pimp My Fridge
					</Link>
				</div>

				{current_user?.id ? (
					<>
						<Link to="/meal-planner" className="left-links">
							Planifie tes repas
						</Link>
						<Link to="/mappage" className="left-links">
							Fais tes courses
						</Link>
						<Link to="/dashboard" className="left-links">
							Ton récap !
						</Link>
						<Link to="/userrecipe" className="left-links">
							Tes recettes
						</Link>
					</>
				) : null}
			</div>

			{/* Conteneur des boutons de connexion et inscription à droite */}
			<div className="auth-links">
				{current_user.id ? (
					<button className="auth-button" onClick={logout}>
						Déconnexion
					</button>
				) : (
					<button className="auth-button" onClick={toggleModalLogin}>
						Connexion
					</button>
				)}
				{current_user.id ? (
					<div className="user" onClick={settings}>
						<AccountCircle />
						<p>{current_user.username}</p>
					</div>
				) : (
					<button className="auth-button" onClick={toggleModalSignup}>
						Inscription
					</button>
				)}
			</div>

			{isModalLoginOpen && <AuthModal toggleModal={toggleModalLogin} />}
			{isModalSignupOpen && <SignUp toggleModal={toggleModalSignup} />}
		</nav>
	);
}

export default Header;
