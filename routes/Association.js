// associationRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Association = require('../models/Association'); // Adjust path as needed
const checkApiKey = (req, res, next) => {


const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.JWT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};





// PATCH /associations/:id - Update specific association fields
router.patch('/:id', async (req, res) => {
  try {
    // List of allowed fields that can be updated via PATCH
    const allowedFields = ['name', 'email', 'Description', 'Location', 'password'];
    const updates = Object.keys(req.body);
    
    // Check for disallowed fields
    const disallowedUpdates = updates.filter(
      field => !allowedFields.includes(field)
    );
    
    if (disallowedUpdates.length > 0) {
      return res.status(400).json({
        error: `Invalid fields: ${disallowedUpdates.join(', ')}`,
        allowedFields: allowedFields
      });
    }

    // Find the association
    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }

    // Process password hashing if included
    if (updates.includes('password')) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Apply updates
    updates.forEach(update => {
      association[update] = req.body[update];
    });

    await association.save();

    // Return updated association (without password)
    const associationObj = association.toObject();
    delete associationObj.password;
    
    res.json(associationObj);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate field value' });
    }
    res.status(400).json({ error: error.message });
  }
});





// Update association status (enable/disable)
router.patch('/:id/status', checkApiKey, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['enabled', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const association = await Association.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }

    res.json(association);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});   






// List all associations
router.get('/', async (req, res) => {
  try {
    const associations = await Association.find().select('-password');
    res.json(associations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});




// Get association by ID
router.get('/:id', async (req, res) => {
  try {
    const association = await Association.findById(req.params.id).select('-password');
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    res.json(association);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get association by name
router.get('/name/:name', async (req, res) => {
  try {
    const association = await Association.findOne({ name: req.body.name }).select('-password');
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    res.json(association);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;