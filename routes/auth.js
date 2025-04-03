const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Association = require("../models/Association");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET="JWT_CASA"

router.post("/register", async (req, res) => {
    try {
      const data = req.body;
      
      // Handle Anonymous Users
      if (data.isAnonymous || data.role === 'anonymous') {
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
        if (!data.association) {
          return res.status(400).json({ message: "Association is required for upgrade" });
        }
        const associationExists = await Association.exists({ _id: data.association });
        if (!associationExists) {
          return res.status(400).json({ message: "Association does not exist" });
        }
      }
  
      // Hash the password before creating user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
  
      // Create user with hashed password
      const newUser = new User({
        ...data,
        password: hashedPassword, // Use the hashed password
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
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.json({ token });
  
    } catch (error) {
      res.status(500).json({ message: "Server error during login" });
    }
  });


  module.exports = router; // Correct export ✅
