import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import SignUp from "./pages/signUp/SignUp";
import UserPreferences from "./pages/userPreferences/UserPreferences";
import UserSettings from "./pages/userSettings/UserSettings";
import Recipes from "./pages/recipes/Recipes";
import UserRecipes from"./pages/userRecipes/UserRecipes";
import NotFound from "./pages/notfound/Notfound";
import MealPlanner from "./pages/mealplanner/MealPlanner";
import Dashboard from "./pages/dashboard/Dashboard";
import ShoppingList from "./pages/shoppingList/ShoppingList";
import MapPage from "./pages/mapPage/MapPage";

function App() {
	return (
		<Router>
			<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
				<Header />
				<main style={{ flex: 1 }}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/signup" element={<SignUp />} />
						<Route path="/user-preferences" element={<UserPreferences />} />
						<Route path="/settings" element={<UserSettings />} />
						<Route path="/userpreferences" element={<UserPreferences />} />
						<Route path="/recipe" element={<Recipes />} />
						<Route path="/userrecipe" element={<UserRecipes />} />
						<Route path="/meal-planner" element={<MealPlanner />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/shoppinglist" element={<ShoppingList />} />
						<Route path="/notfound" element={<NotFound />} />
						<Route path="/mappage" element={<MapPage />} />
						{/* <Route path="/recipelist" element={<RecipeListModal />} /> */}
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
