const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionController");

// CRUD endpoints for Region
router.post("/", regionController.createRegion);
router.get("/", regionController.getRegions);
router.get("/:id", regionController.getRegionById);
router.put("/:id", regionController.updateRegion);
router.delete("/:id", regionController.deleteRegion);

module.exports = router;
