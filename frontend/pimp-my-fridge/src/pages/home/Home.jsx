import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SignUp from "../signUp/SignUp";
import "./Home.css";
import { useSelector } from "react-redux";

function Home() {
	const navigate = useNavigate();
	let current_user = useSelector(state => state.userReducer.user);
	const [isModalSignupOpen, setIsModalSignupOpen] = useState(false);

	// Gestion des modals
	const toggleModalSignup = () => {
		setIsModalSignupOpen(!isModalSignupOpen);
	};

	useEffect(() => {
		if (current_user.id && current_user.isFirstLogin) {
			navigate("/user-preferences");
		}
	}, [current_user, navigate]);


	return (
		<>
			<div className="home-container">
				<div className="text-left">
					<h1 className="title">Des repas bien pensés, des courses facilitées !</h1>
					<p className="subtitle">Commencez à personnaliser vos repas dès aujourd'hui.</p>
					<div className="buttons">
						<Link className="button signup" onClick={toggleModalSignup}>
							Créer un compte
						</Link>
						<Link to="/recipe" className="button explore">
							Explorer
						</Link>
					</div>
				</div>

				<div className="image-right">
					{/* Ajoutez l'événement onClick pour ouvrir la modal */}
					<img
						src="/images/home.jpeg"
						alt="Illustration repas"
						className="image"
					/>
				</div>
			</div>

			{/* Modal SignUp */}
			{isModalSignupOpen && <SignUp toggleModal={toggleModalSignup} />}
		</>
	);
}

export default Home;
