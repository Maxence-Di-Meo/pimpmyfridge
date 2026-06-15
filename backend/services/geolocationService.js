const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const geolocate = async () => {
	try {
		const response = await fetch(
			`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GOOGLE_API_KEY}`,
			{
				method: "POST",
			}
		);
		return await response.json();
	} catch (error) {
		console.error("Erreur lors de l'accès à la position via Google :", error);
		throw new Error("Erreur lors de l'accès à la position");
	}
};

const findNearbySupermarkets = async (latitude, longitude) => {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&type=supermarket&key=${process.env.GOOGLE_API_KEY}`
		);
		const supermarkets = await response.json();

		// Add CO2 emissions to each supermarket
		await Promise.all(
			supermarkets.results.map(async supermarket => {
				const distanceResponse = await fetch(
					`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${supermarket.geometry.location.lat},${supermarket.geometry.location.lng}&key=${process.env.GOOGLE_API_KEY}`
				);
				const distanceData = await distanceResponse.json();
				const distance = distanceData.rows[0].elements[0].distance.value;

				// Assuming an average emission factor of 0.21 kg CO2 per km for a car
				const emissionFactor = 0.21;
				const co2Emissions = (distance / 1000) * emissionFactor;

				// Add the co2Emissions property to the supermarket object
				supermarket.co2Emissions = co2Emissions;
			})
		);

		return supermarkets;
	} catch (error) {
		console.error("Erreur lors de la récupération des supermarchés :", error);
		throw new Error("Erreur lors de la récupération des supermarchés");
	}
};

module.exports = { geolocate, findNearbySupermarkets };
