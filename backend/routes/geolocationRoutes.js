const express = require("express");
const { geolocateUser, getNearbySupermarkets } = require("../controllers/geolocationController");

const router = express.Router();

router.post("/geolocate", geolocateUser);
router.get("/nearby-supermarkets", getNearbySupermarkets);

module.exports = router;
