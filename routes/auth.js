const express = require("express");
const router = express.Router();
const { uploadPartnershipDoc } = require("../config/multerConfig");
const {
  register,
  login,
  adminLogin,
  associationLogin,
  createAssociation,
} = require("../controllers/auth");

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Admin login (using fullName + password)
router.post("/admin/login", adminLogin);

// Association login (using email + password)
router.post("/association/login", associationLogin);

// Create association
router.post("/association/register", uploadPartnershipDoc, createAssociation);

module.exports = router;
