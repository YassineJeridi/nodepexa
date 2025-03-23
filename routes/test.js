const express = require('express');
const router = express.Router();
const UserActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Association = require('../models/Association');

// CREATE - Log a new activity (with validation)
router.post('/', async (req, res) => {
  try {
    const { user, association, admin, activityType, activityDescription } = req.body;

    // Validate required fields
    if (!activityType || !activityDescription) {
      return res.status(400).json({ message: 'activityType and activityDescription are required' });
    }

    // Validate referenced entities
    if (user) {
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(404).json({ message: 'Referenced user not found' });
      }
    }

    if (association) {
      const associationExists = await Association.findById(association);
      if (!associationExists) {
        return res.status(404).json({ message: 'Referenced association not found' });
      }
    }

    if (admin) {
      const adminExists = await Admin.findById(admin);
      if (!adminExists) {
        return res.status(404).json({ message: 'Referenced admin not found' });
      }
    }

    // Create and save the log
    const newLog = new UserActivityLog({
      user,
      association,
      admin,
      activityType,
      activityDescription
    });

    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});