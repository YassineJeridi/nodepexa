const express = require("express");
const router = express.Router();
const {
  getDonationBoxesForAssociation,
  getAvailableVolunteers,
} = require("../../controllers/associationDashboard/box");

// GET /api/associationDashboard/:associationId/boxes
router.get("/:associationId/boxes", getDonationBoxesForAssociation);

// GET /api/associationDashboard/:associationId/available-volunteers
router.get("/:associationId/available-volunteers", getAvailableVolunteers);

module.exports = router;
