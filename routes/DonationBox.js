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
  getAllDonationBoxes,
  getDonationChartData,
  deleteDonationBox,
} = require("../controllers/donationBox");

// Routes
router.post("/", createDonationBox);
router.patch("/region/:id", addRegion);
router.post("/items/:id", addItem);
router.delete("/:id", deleteDonationBox);
router.delete("/items/:id", removeItem);
router.patch("/items/:id", changeQuantity);
router.patch("/status/:id", updateStatus);
router.get("/", getAllDonationBoxes);
router.get("/chart", getDonationChartData);
router.get("/:id", getDonationBoxById);

module.exports = router;
