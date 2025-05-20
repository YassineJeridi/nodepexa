// routes/associationDashboard/Volunteer.js
const express = require("express");
const router = express.Router();

const { getVolunteersByAssociation , removeVolunteer} = require("../../controllers/associationDashboard/Volunteer");


router.get("/:associationId/volunteers" , getVolunteersByAssociation);
router.patch("/volunteer/:id/remove", removeVolunteer);
module.exports = router;
