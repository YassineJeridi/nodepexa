// /routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();

// Import controllers
const userController = require("../controllers/AdminDashboard/userController");
const volunteerController = require("../controllers/AdminDashboard/volunteerController");
const associationController = require("../controllers/AdminDashboard/associationController");
const inventoryController = require("../controllers/AdminDashboard/inventoryController");
const donationController = require("../controllers/AdminDashboard/donationController");

// Group routes under /admin
router.use("/users", userController);
router.use("/volunteers", volunteerController);
router.use("/associations", associationController);
router.use("/inventory", inventoryController);
router.use("/donations", donationController);

module.exports = router;
