
const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUserDonations,

  getUserBoxesWithStatusFilter,
} = require("../../controllers/UserDashboard/UserDashboard");

router.get("/:id", getUserById);
router.get("/:id/donations", getUserDonations);
router.get(
  "/:userId/withStatusFilter",
  getUserBoxesWithStatusFilter
);
module.exports = router;
