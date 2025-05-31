const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserByPhone,
  updateUser,
  deleteUser,
  getUserById,
  updateUserPassword,
} = require("../controllers/user");

router.get("/", getAllUsers);
router.get("/phone/:phone", getUserByPhone);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/password", updateUserPassword);
module.exports = router;
