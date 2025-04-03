const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Association = require("../models/Association");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware for API key authentication
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized - Invalid API Key" });
  }
};

// User Registration
router.post("/register", async (req, res) => {
  try {
    const data = req.body;

    // Handle Anonymous Users
    if (data.isAnonymous || data.role === 'anonymous') {
      console.log("Anonymous user registration attempt:", data);
      
      const anonymousUser = new User({
        isAnonymous: true,
        role: 'anonymous'
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
      console.log("User registration data:", data);
      if (data.association === null || data.association === undefined) {
        return res.status(400).json({ message: "Association is required for upgrade" });
      }
      const associationExists = await Association.exists({ _id: data.association });
      if (!associationExists) {
        return res.status(400).json({ message: "Association does not exist" });
      }
    }

    // Create user
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
    res.status(500).json({ message: "Server error during registration" });
  }
});

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

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const usersWithStatus = users.map(user => ({
      ...user.toObject(),
      status: user.isAnonymous ? 'anonymous' : user.role
    }));
    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Get User by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const status = user.isAnonymous ? 'anonymous' : user.role;
    res.json({ ...user.toObject(), status });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user" });
  }
});

// Update User
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;

    // Validate association if upgrading
    if (updates.upgradeStatus) {
      if (!updates.association) {
        return res.status(400).json({ message: "Association required for upgrade" });
      }
      const associationExists = await Association.exists({ _id: updates.association });
      if (!associationExists) {
        return res.status(400).json({ message: "Association does not exist" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }
    res.status(500).json({ message: "Error updating user" });
  }
});

// Upgrade to Volunteer with Association
router.put("/:id/upgrade", async (req, res) => {
  try {
    const { association } = req.body;
    if (!association) {
      return res.status(400).json({ message: "Association required" });
    }

    const associationExists = await Association.exists({ _id: association });
    if (!associationExists) {
      return res.status(400).json({ message: "Association not found" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { upgradeStatus: true, association },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error upgrading user" });
  }
});

// Admin Routes (Protected with API Key)
// Approve Volunteer
router.put("/:id/approve", apiKeyMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { VolunteerStatus: 'enabled', badge: 'no badge yet' },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== 'volunteer') {
      return res.status(400).json({ message: "User is not a volunteer" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error approving volunteer" });
  }
});

// Update Volunteer Details
router.put("/:id/volunteer", apiKeyMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.association) {
      const associationExists = await Association.exists({ _id: updates.association });
      if (!associationExists) {
        return res.status(400).json({ message: "Association not found" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user || user.role !== 'volunteer') {
      return res.status(400).json({ message: "Invalid volunteer" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating volunteer" });
  }
});

// Disable Volunteer
router.put("/:id/disable-volunteer", apiKeyMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { VolunteerStatus: 'disabled' },
      { new: true }
    ).select('-password');

    if (!user || user.role !== 'volunteer') {
      return res.status(400).json({ message: "Invalid volunteer" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error disabling volunteer" });
  }
});

// Disable User
router.put("/:id/disable-user", apiKeyMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { UserStatus: 'disabled' },
      { new: true }
    ).select('-password');

    if (!user || user.role !== 'donor') {
      return res.status(400).json({ message: "Invalid user" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error disabling user" });
  }
});

module.exports = router;