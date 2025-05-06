const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/AdminDashboard/UsersManagement");

router.get("/top-donors", usersController.getTopDonors);
router.get("/users", usersController.getLatestUsers);
router.post("/add-user", usersController.addNewUser);

module.exports = router;
