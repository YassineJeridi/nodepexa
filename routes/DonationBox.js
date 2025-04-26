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
} = require("../controllers/donationBox");

// Routes
router.post("/", createDonationBox);
router.patch("/region/:id", addRegion);
router.post("/items/:id", addItem);
router.delete("/items/:id", removeItem);
router.patch("/items/:id", changeQuantity);
router.patch("/status/:id", updateStatus);
router.get("/:id", getDonationBoxById);
router.get("/", getAllDonationBoxes);
module.exports = router;
