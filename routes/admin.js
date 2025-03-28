const Admin = require("./models/Admin"); // Adjust path as needed

// CREATE (Add a new admin)
const createAdmin = async (req, res) => {
  try {
    const { name } = req.body;
    const newAdmin = new Admin({ name });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ (Get all admins)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// READ (Get admin by name)
const getAdminByName = async (req, res) => {
  try {
    const { name } = req.params;
    const admin = await Admin.findOne({ name });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE (Edit admin by ID)
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Returns the updated document
    );
    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json(updatedAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE (Remove admin by ID)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminByName,
  updateAdmin,
  deleteAdmin,
};