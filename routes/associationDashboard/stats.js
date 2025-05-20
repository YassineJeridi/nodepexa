const express = require("express");
const router = express.Router();
const {
  getAssociationOverviewStats,
  getDistributedPerDay,
} = require("../../controllers/associationDashboard/stats");

router.get("/:id/stats/overview", getAssociationOverviewStats);
router.get("/:id/stats/distributed-per-day", getDistributedPerDay);

module.exports = router;
