const express = require("express");
const router = express.Router();

// Example association dashboard route
router.get("/", (req, res) => {
  res.json({ message: "Association Dashboard" });
});

module.exports = router;