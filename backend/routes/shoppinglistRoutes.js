const express = require("express");
const {getRecentRecipeAndShoppingList } = require("../controllers/shoppinglistController.js");
const router = express.Router();

router.get("/:id", getRecentRecipeAndShoppingList);

module.exports = router;
