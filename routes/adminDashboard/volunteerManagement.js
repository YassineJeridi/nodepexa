const express = require("express");
const router = express.Router();
const {
  getTopVolunteer,
  getAvailableBoxes,
  getTodaysDistributed,
  getTotalVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getApprovalRequests,
  getAllAssociations,
} = require("../../controllers/AdminDashboard/volunteerManagement");

// ✅ Use proper route paths with leading slash
router.get("/topWeek", getTopVolunteer);
router.get("/availableBoxes", getAvailableBoxes);
router.get("/todaysDistributed", getTodaysDistributed);
router.get("/totalVolunteers", getTotalVolunteers);
router.get("/associations", getAllAssociations);
router.get("/approvalRequests", getApprovalRequests);

router.post("/approveVolunteer/:id", approveVolunteer);
router.post("/rejectVolunteer/:id", rejectVolunteer); 

module.exports = router;
