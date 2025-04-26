const express = require("express");
const router = express.Router();
const {
  getAssociations,
  getAssociationById,
  updateAssociation,
  deleteAssociation,
} = require("../controllers/association");

router.get("/", getAssociations);
router.get("/:id", getAssociationById);
router.patch("/:id", updateAssociation);
router.delete("/:id", deleteAssociation);

module.exports = router;
