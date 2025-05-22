// routes/associationDashboard/Volunteer.js

const express = require("express");
const router = express.Router();

const {
  getVolunteersByAssociation,
  removeVolunteer,
  getPendingVolunteerApplications,
  setVolunteerApproval,
  getVolunteerEvolution,
  getVolunteerStats,
} = require("../../controllers/associationDashboard/Volunteer");

// Get all volunteers for an association
router.get("/:associationId/volunteers", getVolunteersByAssociation);

// Remove a volunteer (corrected route: PATCH /:associationId/volunteers/:userId/remove)
router.patch("/:associationId/volunteers/:userId/remove", removeVolunteer);

// Get pending volunteer applications
router.get(
  "/:associationId/volunteers/pending",
  getPendingVolunteerApplications
);

// Approve/reject a volunteer application
router.patch(
  "/:associationId/volunteers/:userId/approve",
  setVolunteerApproval
);

// Get volunteer evolution data
router.get("/:associationId/volunteers/evolution", getVolunteerEvolution);

// Get volunteer stats
router.get("/:associationId/volunteers/stats", getVolunteerStats);

module.exports = router;
