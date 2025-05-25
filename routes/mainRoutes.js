//routes/mainRoutes.js

const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");

// Donations
router.get("/donations/count", mainController.getDonationsCount);

// Users
router.get("/users/roles/count", mainController.getUserRoleCounts); // Donor + Volunteer counts

// Partners
router.get("/partners/count", mainController.getPartnersCount);

module.exports = router;
