const { geolocate, findNearbySupermarkets } = require("../services/geolocationService");

const geolocateUser = async (req, res) => {
	try {
		const data = await geolocate();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getNearbySupermarkets = async (req, res) => {
	const { latitude, longitude } = req.query;
	try {
		const data = await findNearbySupermarkets(latitude, longitude);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = { geolocateUser, getNearbySupermarkets };
