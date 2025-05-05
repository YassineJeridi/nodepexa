const express = require("express");
const router = express.Router();
const MainDashboard = require("../controllers/AdminDashboard/MainDashboard");

// ✅ Define all routes
router.get("/chart-data", MainDashboard.DonationChart); // ✅ Chart endpoint
router.get("/recent-donations", MainDashboard.RecentDonations);
router.get("/today-donations", MainDashboard.TodayDonations);
router.get("/new-users", MainDashboard.NewUsers);
router.get("/recent-users", MainDashboard.RecentUsers);
router.get("/distributed-boxes", MainDashboard.DistributedBoxes);

module.exports = router;
