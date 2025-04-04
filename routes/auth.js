const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Association = require("../models/Association");
const CasaAdmin = require('../models/CasaAdmin');

const upload = require('../uploads/upload'); // Import the upload config
const fs = require('fs');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "JWT_CASA";




// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.isAnonymous) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});





router.post("/register", async (req, res) => {
  try {
    const data = req.body;

    // Handle Anonymous Users
    if (data.isAnonymous || data.role === "anonymous") {
      const anonymousUser = new User({
        isAnonymous: true,
        role: "anonymous"
      });
      await anonymousUser.save();
      return res.status(201).json(anonymousUser);
    }

    // Validate required fields
    const requiredFields = ["role", "fullname", "email", "password", "phone", "address"];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    // Validate volunteer requirements
    if (data.role === 'volunteer' && !data.badge) {
      return res.status(400).json({ message: "Badge is required for volunteers" });
    }

    // Validate association if upgrading
    if (data.upgradeStatus == "enabled") {
      if (!data.association) {
        return res.status(400).json({ message: "Association is required for upgrade" });
      }
      const associationExists = await Association.exists({ _id: data.association });
      if (!associationExists) {
        return res.status(400).json({ message: "Association does not exist" });
      }
    }

    // Create user - password will be hashed automatically by the pre-save hook
    const newUser = new User({
      ...data,
      isAnonymous: false,
      association: data.upgradeStatus ? data.association : undefined
    });

    await newUser.save();

    // Remove sensitive data from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);

  } catch (error) {
    // Handle errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});


/************************  assoication authentification ***********************************************/






router.post("/loginAssociation", async (req, res) => {
  try {
    const { email, password } = req.body;
    const association = await Association.findOne({ email });

    if (!association) return res.status(404).json({ error: "Not found" });
    if (association.status === "disabled") return res.status(403).json({ error: "Account disabled" });

    const isMatch = await association.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate token
    const token = jwt.sign(
      { associationId: association._id, role: 'association' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: "Login successful",
      association: association.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});




router.post("/registerAssociation", upload.single("partnershipDoc"), async (req, res) => {
  try {
    const associationData = { ...req.body };

    // Add file path if file was uploaded
    if (req.file) {
      associationData.partnershipDoc = req.file.path;
    }

    const association = new Association(associationData);
    await association.save(); // Password will be auto-hashed by the pre-save hook

    const associationObj = association.toObject();
    delete associationObj.password;

    res.status(201).json(associationObj);
  } catch (error) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate field value" });
    }
    res.status(400).json({ error: error.message });
  }
});




/************************  Admin authentification ***********************************************/


// Admin Login route



router.post('/adminLogin', async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await CasaAdmin.findOne({ name }).select('+password');

    if (!admin) return res.status(401).json({ error: "Invalid credentials" });
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate token
    const token = jwt.sign(
      { adminId: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      admin: admin.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});












module.exports = router; // Correct export ✅
