const express = require("express");
const router = express.Router();
const MainDashboard = require("../../controllers/AdminDashboard/MainDashboard");

router.get("/chart-data", MainDashboard.DonationChart);
router.get("/recent-donations", MainDashboard.RecentDonations);
router.get("/today-donations", MainDashboard.TodayDonations);
router.get("/new-users", MainDashboard.NewUsers);
router.get("/recent-users", MainDashboard.RecentUsers);
router.get("/distributed-boxes", MainDashboard.DistributedBoxes);

module.exports = router;
