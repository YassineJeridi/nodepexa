const express = require("express");
const router = express.Router();

router.get("/available", donationBoxController.getAvailableBoxesByRegion);
router.patch("/:id/status", donationBoxController.updateBoxStatus);
router.patch("/:id/volunteer-points", donationBoxController.addVolunteerPoints);
router.post(
  "/:id/upload-image",
  upload.single("image"),
  donationBoxController.uploadDistributionImage
);
