const express = require("express");
const router = express.Router();

// Example admin dashboard route
router.get("/", (req, res) => {
  res.json({ message: "Admin Dashboard" });
});

module.exports = router;