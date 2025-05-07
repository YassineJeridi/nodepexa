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


router.post("/register", register);
router.post("/register/anonymous", registerAnonymous);
router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/verifyAdmin", verifyAdmin);
router.post("/association/login", associationLogin);
router.post("/association/register", uploadPartnershipDoc, createAssociation);

module.exports = router;
