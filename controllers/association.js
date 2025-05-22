const Association = require("../models/Association");

const fs = require("fs");
const path = require("path");

exports.getAssociations = async (req, res) => {
  try {
    const associations = await Association.find();
    res.json(associations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get association by ID

exports.getAssociationById = async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({ message: "Association not found" });
    }
    res.json(association);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch association" });
  }
};
// Update association
// Update association (fix for password hashing)
exports.updateAssociation = async (req, res) => {
  try {
    const association = await Association.findById(req.params.id);
    if (!association)
      return res.status(404).json({ error: "Association not found" });

    // Update fields
    if (req.body.name) association.name = req.body.name;
    if (req.body.email) association.email = req.body.email;
    if (req.body.phone) association.phone = req.body.phone;
    if (req.body.address !== undefined) association.address = req.body.address;
    if (req.body.password) association.password = req.body.password; // Will be hashed by pre-save

    await association.save(); // Triggers pre-save hook

    // Remove password from response
    const updated = association.toObject();
    delete updated.password;

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete association

exports.deleteAssociation = async (req, res) => {
  try {
    // 1. Delete association from database
    const association = await Association.findByIdAndDelete(req.params.id);
    if (!association) {
      return res.status(404).json({ error: "Association not found" });
    }
    // 2. Rename partnership document if it exists
    if (association.partnershipDoc) {
      const originalPath = association.partnershipDoc;
      const ext = path.extname(originalPath);
      const baseName = path.basename(originalPath, ext);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const newFileName = `deleted_${association.name}_${date}${ext}`;
      const newPath = path.join(path.dirname(originalPath), newFileName);

      // Rename the file
      fs.renameSync(originalPath, newPath);
    }

    res.json({
      message: "Association deleted successfully",
      renamedDoc: association.partnershipDoc ? newPath : null,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
