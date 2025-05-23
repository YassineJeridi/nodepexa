const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUserDonations,
} = require("../../controllers/UserDashboard/UserDashboard");

// Get user by ID
router.get("/:id", getUserById);

// Get all donations for a user
router.get("/:id/donations", getUserDonations);

module.exports = router;
