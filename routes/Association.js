const express = require('express');
const router = express.Router();
const Association = require('../models/Association');
const bcrypt = require('bcrypt');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const association = await Association.findOne({ email });
    
    if (!association) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, association.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json(association);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Association
router.post('/', async (req, res) => {
  try {
    const association = new Association(req.body);
    await association.save();
    res.status(201).json(association);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email or AssociationID already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update Association
router.put('/:id', async (req, res) => {
  try {
    const association = await Association.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    res.json(association);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Association + Disable Volunteers
router.delete('/:id', async (req, res) => {
  try {
    const association = await Association.findByIdAndDelete(req.params.id);
    
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }

    // Disable associated volunteers
    /*await Volunteer.updateMany(
      { AssociationID: association._id },
      { $set: { VolunteerStatus: 'disabled' } }
    );

    res.json({ message: 'Association deleted and volunteers disabled' });*/
  } 
  catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



// List All Associations
router.get('/', async (req, res) => {
  try {
    const associations = await Association.find();
    res.json(associations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Association by Name
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    const associations = await Association.find({
      name: { $regex: name, $options: 'i' }
    });
    
    res.json(associations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Association by ID
router.get('/:id', async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    
    if (!association) {
      return res.status(404).json({ error: 'Association not found' });
    }
    
    res.json(association);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;