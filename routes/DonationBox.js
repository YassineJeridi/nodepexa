const express = require("express");
const router = express.Router();

const {
  createDonationBox,
  addRegion,
  addItem,
  removeItem,
  changeQuantity,
  updateStatus,
  getDonationBoxById,
  getUserDonations,
  getAllDonationBoxes,
  getDonationChartData,
  removeVolunteer,
  getCollectingBoxByUserId,

  assignVolunteer,
} = require("../controllers/donationBox");

// Routes
router.post("/", createDonationBox);
router.patch("/region/:id", addRegion);
router.post("/items/:id", addItem);
router.get("/:userId/donations", getUserDonations);
router.delete("/items/:id", removeItem);
router.patch("/items/:id", changeQuantity);
router.patch("/status/:id", updateStatus);
router.get("/", getAllDonationBoxes);
router.get("/chart", getDonationChartData);
router.get("/:id", getDonationBoxById);
router.patch("/:id/volunteer", assignVolunteer);
router.patch("/removeVolunteer/:id", removeVolunteer);
router.get("/user/:userId/collecting", getCollectingBoxByUserId);

module.exports = router;
