const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
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
    const newLog = new ActivityLog({
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

// READ - Get all activity logs
router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'fullname  email')
      .populate('association', 'name')
      .populate('admin', 'name');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Get a single activity log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('user', 'fullname email')
      .populate('association', 'name')
      .populate('admin', 'name');

    if (!log) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    // Transform the response
    const transformedLog = {
      ...log.toObject(), // Convert Mongoose document to plain object
      user: log.user ? log.user : 'anonymous' // Replace null with 'anonymous'
    };

    res.json(transformedLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// GET all activity logs for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch activity logs for the user
    const logs = await ActivityLog.find({ user: userId })
      .populate('user', 'fullname email') // Populate user details
      .populate('association', 'name')    // Populate association details
      .populate('admin', 'name')          // Populate admin details
      .sort({ time: -1 });                // Sort by most recent first

    // Transform logs to replace null user with "anonymous"
    const transformedLogs = logs.map(log => ({
      ...log.toObject(),
      user: log.user ? log.user : 'anonymous'
    }));

    res.json(transformedLogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






// DELETE - Delete an activity log (optimized)
router.delete('/:id', async (req, res) => {
  try {
    const result = await ActivityLog.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    res.json({ message: 'Activity log deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;