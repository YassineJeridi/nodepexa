const User = require("../models/User");
const Association = require("../models/Association");
const jwt = require("jsonwebtoken");
const fs = require("fs");

exports.register = async (req, res) => {
  try {
    let userData = req.body;

    if (userData.role == "Admin") {
      const existingAdmin = await User.findOne({
        role: "Admin",
        fullName: userData.fullName,
      });

      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "An Admin with this full name already exists." });
      }
    }

    if (userData.role === "Anonymous") {
      userData = { role: "Anonymous" };
    } else if (
      userData.role === "Donor" &&
      userData.volunteerRequest?.requestedAssociation
    ) {
      const associationExists = await Association.exists({
        _id: userData.volunteerRequest.requestedAssociation,
      });

      if (!associationExists) {
        return res.status(400).json({
          error: "Invalid association ID for volunteer request",
        });
      }
    }

    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists." });
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const message = `${
        duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)
      } already exists.`;
      return res.status(400).json({ message });
    }

    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  const { fullName, password } = req.body;
  const user = await User.findOne({ role: "Admin", fullName });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: "Invalid Admin credentials" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};

exports.associationLogin = async (req, res) => {
  const { email, password } = req.body;
  const association = await Association.findOne({ email });

  if (!association || !(await association.matchPassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: association._id, type: "Association" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};

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
