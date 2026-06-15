import React from "react";
import "./IngredientList.css";

function IngredientList({ ingredients }) {
	return (
		<ul>
			{Object.entries(ingredients).map(([name, details]) => (
				<li key={name}>
					<strong>{name.replace(/_/g, " ")}</strong>: {details.amount}{" "}
					{details.unit || ""}
				</li>
			))}
		</ul>
	);
}

export default IngredientList;
