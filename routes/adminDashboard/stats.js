const express = require("express");
const router = express.Router();
const { getStats } = require("../../controllers/AdminDashboard/UserStats");

router.get("/stats", getStats);

module.exports = router;
