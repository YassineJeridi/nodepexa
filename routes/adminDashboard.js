const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users for admin dashboard
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('association', 'name _id')
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;