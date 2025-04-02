// associationRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const upload = require('../uploads/upload'); // Import the upload config
const fs = require('fs');
const Association = require('../models/Association'); // Adjust path as needed
const checkApiKey = (req, res, next) => {


const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'pexaui the best update status') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};






// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const association = await Association.findOne({ email, status: 'disabled' });
    if (association) {
      return res.status(401).json({ error : "association disabled" });
    }
    else{
      const association = await Association.findOne({ email, status: 'enabled' });
      console.log(association);
      if (!association) {
        return res.status(401).json({ error: 'Invalid credentials or account disabled' });
      }
  
      const isMatch = await bcrypt.compare(password, association.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Remove password before sending response
      const associationObj = association.toObject();
      delete associationObj.password;
  
      res.json({ message: 'Login successful', association: associationObj });
    }
    }

 catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});





// Create association
router.post('/', upload.single('partnershipDoc'), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const associationData = {
      ...req.body,
      password: hashedPassword
    };

    // Add file path if file was uploaded
    if (req.file) {
      associationData.partnershipDoc = req.file.path;
    }

    const association = new Association(associationData);
    await association.save();
    
    const associationObj = association.toObject();
    delete associationObj.password;

    res.status(201).json(associationObj);
  } catch (error) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate field value' });
    }
    res.status(400).json({ error: error.message });
  }
});





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