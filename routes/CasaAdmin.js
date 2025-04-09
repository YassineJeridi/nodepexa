const express = require('express');
const router = express.Router();
const CasaAdmin = require('../models/CasaAdmin');
const bcrypt = require('bcrypt');




// Middleware to verify passkey
const verifyPasskey = (req, res, next) => {
  const apiKey = req.headers['passkey'];
  if (!apiKey || apiKey !== process.env.PASS_KEY) {
    console.error('Invalid or missing passkey:', apiKey);
    return res.status(401).json({ error: 'Invalid or missing passkey' });
  }

  next();
};





router.put('/:id', verifyPasskey, async (req, res) => {
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
router.delete('/:id', verifyPasskey, async (req, res) => {
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
router.get('/', verifyPasskey , async (req, res) => {
  try {
    const admins = await CasaAdmin.find().sort({ joiningDate: -1 });
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






// 6. Get Admin by ID (Protected)
router.get('/:id', verifyPasskey, async (req, res) => {
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
router.get('/name/:name', verifyPasskey, async (req, res) => {
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