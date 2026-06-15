import { useNavigate } from "react-router-dom";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
			}}
		>
			<div style={{ maxWidth: "800px", textAlign: "center" }}>
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
					<h1 style={{ fontSize: "6rem" }}>404</h1>
					<p style={{ fontSize: "1.5rem" }}>The page you’re looking for doesn’t exist.</p>
					<button
						onClick={() => navigate("/")}
						style={{ padding: "10px 20px", fontSize: "1rem", cursor: "pointer" }}
					>
						Back Home
					</button>
				</div>
			</div>
		</div>
	);
}
