const express = require('express');
const router = express.Router();
const Box = require('../models/Box');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Product = require('../models/Product');

// CREATE - Create a new box
router.post('/', async (req, res) => {
  try {
    const { donation, user, items, region } = req.body;

    // Validate required fields
    if (!donation || !user || !items || !region) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate donation exists
    const donationExists = await Donation.findById(donation);
    if (!donationExists) {
      return res.status(404).json({ message: 'Referenced donation not found' });
    }

    // Validate user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ message: 'Referenced user not found' });
    }

    // Validate all products in items exist
    for (const item of items) {
      const productExists = await Product.findById(item.product);
      if (!productExists) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
    }

    // Create and save the box
    const newBox = new Box({
      donation,
      user,
      items,
      region
    });

    const savedBox = await newBox.save();
    res.status(201).json(savedBox);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Get all boxes
router.get('/', async (req, res) => {
  try {
    const boxes = await Box.find()
      .populate('donation', 'donationID status') // Populate donation details
      .populate('user', 'fullname email')        // Populate user details
      .populate('items.product', 'name price');  // Populate product details

    res.json(boxes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Get boxes for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch boxes for the user
    const boxes = await Box.find({ user: userId })
      .populate('donation', 'donationID status') // Populate donation details
      .populate('user', 'fullname email')        // Populate user details
      .populate('items.product', 'name price');  // Populate product details

    res.json(boxes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Get a single box by ID
router.get('/:id', async (req, res) => {
  try {
    const box = await Box.findById(req.params.id)
      .populate('donation', 'donationID status') // Populate donation details
      .populate('user', 'fullname email')        // Populate user details
      .populate('items.product', 'name price');  // Populate product details

    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    res.json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE - Update a box
router.patch('/:id', async (req, res) => {
  try {
    const { donation, user, items, region } = req.body;

    // Validate box exists
    const box = await Box.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Validate donation exists (if provided)
    if (donation) {
      const donationExists = await Donation.findById(donation);
      if (!donationExists) {
        return res.status(404).json({ message: 'Referenced donation not found' });
      }
      box.donation = donation;
    }

    // Validate user exists (if provided)
    if (user) {
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(404).json({ message: 'Referenced user not found' });
      }
      box.user = user;
    }

    // Validate products in items (if provided)
    if (items) {
      for (const item of items) {
        const productExists = await Product.findById(item.product);
        if (!productExists) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
      }
      box.items = items;
    }

    // Update region (if provided)
    if (region) box.region = region;

    const updatedBox = await box.save();
    res.json(updatedBox);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Delete a box
router.delete('/:id', async (req, res) => {
  try {
    const result = await Box.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Box not found' });
    }

    res.json({ message: 'Box deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;