const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
} = require("../controllers/AdminDashboard/MainDashboard");

// Single endpoint for dashboard data
router.get("/summary", getDashboardSummary);

module.exports = router;
