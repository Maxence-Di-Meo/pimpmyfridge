const express = require("express");
const {
	registerUser,
	loginUser,
	setUserPreferences,
	getUserPreferences,
	updateUserPreferences,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/preferences", setUserPreferences);
router.get("/preferences/:userId", getUserPreferences);
router.put("/preferences", updateUserPreferences);

module.exports = router;
