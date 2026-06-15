import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/footer/Footer";

test("renders footer with correct text", () => {
	render(<Footer />);
	const year = new Date().getFullYear();
	expect(screen.getByText(`© ${year} PimpMyFridge. Tous droits réservés.`)).toBeInTheDocument();
	expect(screen.getByText("Mentions Légales")).toBeInTheDocument();
	expect(screen.getByText("Contact")).toBeInTheDocument();
});
