const express = require("express");
const router = express.Router();
const { uploadPartnershipDoc } = require("../config/multerConfig");
const {
  register,
  registerAnonymous,
  registerAdmin,
  login,
  adminLogin,
  associationLogin,
  createAssociation,
  verifyAdmin,
} = require("../controllers/auth");

// User registration
router.post("/register", register);

// Anonymous user registration
router.post("/register/anonymous", registerAnonymous);

// Admin registration
router.post("/register/admin", registerAdmin);

// User login
router.post("/login", login);

// Admin login (using fullName + password)
router.post("/admin/login", adminLogin);

// Verify admin (using token)
router.post("/verifyAdmin", verifyAdmin);

// Association login (using email + password)
router.post("/association/login", associationLogin);

// Create association
router.post("/association/register", uploadPartnershipDoc, createAssociation);

module.exports = router;
