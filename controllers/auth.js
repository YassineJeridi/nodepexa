//controllers/auth.js
const User = require("../models/User");
const Association = require("../models/Association");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { log } = require("console");

exports.register = async (req, res) => {
  try {
    const userData = req.body;

    // Validate donor request to become a volunteer (if applicable)
    if (userData.role === "Donor" && userData.requestedAssociation) {
      const associationExists = await Association.exists({
        _id: userData.requestedAssociation,
      });

      if (!associationExists) {
        return res.status(400).json({
          error: "Invalid association ID for volunteer request",
        });
      }
    }

    // Email check
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Phone check
    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists." });
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const message =
        duplicateField.charAt(0).toUpperCase() +
        duplicateField.slice(1) +
        " already exists.";
      return res.status(400).json({ message });
    }

    res.status(400).json({ error: error.message });
  }
};

/********************************************************************************/
exports.registerAnonymous = async (req, res) => {
  try {
    const user = await User.create({ role: "Anonymous" });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/********************************************************************************/

exports.registerAdmin = async (req, res) => {
  try {
    const userData = req.body;

    const existingAdmin = await User.findOne({
      role: "Admin",
      fullName: userData.fullName,
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "An Admin with this full name already exists.",
      });
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const message =
        duplicateField.charAt(0).toUpperCase() +
        duplicateField.slice(1) +
        " already exists.";
      return res.status(400).json({ message });
    }

    res.status(400).json({ error: error.message });
  }
};

/********************************************************************************/

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // 4. Send response
    res.json({
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/********************************************************************************/

exports.verifyAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ isValid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "Admin") {
      return res
        .status(403)
        .json({ isValid: false, message: "Not authorized as admin" });
    }

    return res.status(200).json({ isValid: true }); // ✅ This is the key
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ isValid: false, message: "Invalid token" });
  }
};

/********************************************************************************/

exports.adminLogin = async (req, res) => {
  try {
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      return res
        .status(400)
        .json({ error: "Full name and password are required" });
    }

    const user = await User.findOne({ fullName, role: "Admin" });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid Admin credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/********************************************************************************/

exports.createAssociation = async (req, res) => {
  try {
    const association = await Association.create({
      ...req.body,
      partnershipDoc: req.file?.path,
    });
    res.status(201).json(association);
  } catch (error) {
    // Cleanup uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("File cleanup failed:", unlinkErr);
      });
    }

    // Handle duplicate email error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Association with this email already exists",
      });
    }

    res.status(400).json({ error: error.message });
  }
};

exports.associationLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const association = await Association.findOne({ email });

    if (!association || !(await association.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { AssociationId: association._id, role: "Association" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);

    res.status(200).json({
      message: "Login successful",
      token,
      association: {
        id: association._id,
        name: association.name,
        email: association.email,
      },
    });
  } catch (error) {
    console.error("Association login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/********************************************************************************/

exports.associationLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const association = await Association.findOne({ email });

    if (!association || !(await association.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: association._id, role: "Association" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      association: {
        id: association._id,
        name: association.name,
        email: association.email,
      },
    });
  } catch (error) {
    console.error("Association login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
