const Association = require("../models/Association");
const fs = require('fs');
const path = require('path');


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
    if (!association)
      return res.status(404).json({ error: "Association not found" });
    res.json(association);                                             
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update association
exports.updateAssociation = async (req, res) => {
  try {
    const association = await Association.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!association)
      return res.status(404).json({ error: "Association not found" });
    res.json(association);
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
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const newFileName = `deleted_${association.name}_${date}${ext}`;
      const newPath = path.join(path.dirname(originalPath), newFileName);

      // Rename the file
      fs.renameSync(originalPath, newPath);
    }

    res.json({ 
      message: "Association deleted successfully",
      renamedDoc: association.partnershipDoc ? newPath : null
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: "Server error" });
  }
};