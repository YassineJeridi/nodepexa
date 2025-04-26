const express = require("express");
const router = express.Router();
const {
  requestVolunteer,
  getAllUsers,
  getUserByPhone,
  updateUser,
  deleteUser,
} = require("../controllers/user");

router.get("/", getAllUsers);
router.get("/phone/:phone", getUserByPhone);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

/* 
//Add authorization checks for admin-only operations


const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

*/
