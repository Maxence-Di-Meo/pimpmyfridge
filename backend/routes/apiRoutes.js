const express = require("express");
const {fetchAndStoreRecipes } = require("../controllers/apiController");
const router = express.Router();

router.post("/", fetchAndStoreRecipes);

module.exports = router;
