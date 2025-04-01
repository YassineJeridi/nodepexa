const express = require('express');
const router = express.Router();
const CasaAdmin = require('../models/CasaAdmin');
const bcrypt = require('bcrypt');
const PASS_KEY1 = "pexaui the best add"; // Your secret passkey for create
const PASS_KEY2 = "pexaui the best update"; // Your secret passkey for update
const PASS_KEY3 = "pexaui the best delete"; // Your secret passkey for delete
const PASS_KEY4 = "pexaui the best Data"; // Your secret passkey for data


// Middleware to verify passkey
const verifyPasskeyAdd = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== PASS_KEY1) {
    return res.status(401).json({ error: 'Invalid or missing passkey' });
  }
  next();
};
const verifyPasskeyUpdate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== PASS_KEY2) {
    return res.status(401).json({ error: 'Invalid or missing passkey' });
  }
  next();
};

const verifyPasskeyDelete = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== PASS_KEY3) {
    return res.status(401).json({ error: 'Invalid or missing passkey' });
  }
  next();
};

const verifyPasskeyData = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== PASS_KEY4) {
    return res.status(401).json({ error: 'Invalid or missing passkey' });
  }
  next();
};











// 1. Middleware to verify passkey for login route
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate input
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // Find admin and explicitly select password
    const admin = await CasaAdmin.findOne({ name }).select('+password');
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return admin data (password will be hidden by toJSON)
    res.json({
      message: 'Login successful',
      admin: admin.toJSON()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









// 2. Create Admin (Protected)
router.post('/create', verifyPasskeyAdd, async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate input
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // Check if admin already exists
    const existingAdmin = await CasaAdmin.findOne({ name });
    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin already exists' });
    }

    // Hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the admin
    const newAdmin = new CasaAdmin({
      name,
      password: hashedPassword // Store the hashed version
    });

    await newAdmin.save();

    // Return admin without password (due to toJSON transform)
    res.status(201).json(newAdmin);

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});








router.put('/:id', verifyPasskeyUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    // Validate input
    if (!name && !password) {
      return res.status(400).json({ error: 'At least one field (name or password) is required to update' });
    }

    // Find the admin
    const admin = await CasaAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Update fields if provided
    if (name) admin.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.json(admin);

  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






// 4. Delete Admin (Protected)
router.delete('/:id', verifyPasskeyDelete, async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await CasaAdmin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });

  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// 5. List All Admins (Protected)
router.get('/', verifyPasskeyData , async (req, res) => {
  try {
    const admins = await CasaAdmin.find().sort({ joiningDate: -1 });
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






// 6. Get Admin by ID (Protected)
router.get('/:id', verifyPasskeyData, async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await CasaAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);

  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// 7. Get Admin by Name (Protected)
router.get('/name/:name', verifyPasskeyData, async (req, res) => {
  try {
    const { name } = req.params;

    const admin = await CasaAdmin.findOne({ name });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);

  } catch (error) {
    console.error('Error fetching admin by name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;