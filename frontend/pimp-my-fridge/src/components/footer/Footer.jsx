import React from "react";
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} PimpMyFridge. Tous droits réservés.</p>
            <div className="footer-links">
                <a href="/mentions-legales">Mentions Légales</a>
                <a href="/contact">Contact</a>
            </div>
        </footer>
    );
}

export default Footer;