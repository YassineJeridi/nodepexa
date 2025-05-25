const Region = require("../models/Region");

// Create a new region
exports.createRegion = async (req, res) => {
  try {
    const { name } = req.body;
    const region = new Region({ name });
    await region.save();
    res.status(201).json(region);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to create region" });
  }
};

// Get all regions
exports.getRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch regions" });
  }
};

// Get a single region by ID
exports.getRegionById = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) return res.status(404).json({ error: "Region not found" });
    res.json(region);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch region" });
  }
};

// Update a region by ID
exports.updateRegion = async (req, res) => {
  try {
    const { name } = req.body;
    const region = await Region.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!region) return res.status(404).json({ error: "Region not found" });
    res.json(region);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to update region" });
  }
};

// Delete a region by ID
exports.deleteRegion = async (req, res) => {
  try {
    const region = await Region.findByIdAndDelete(req.params.id);
    if (!region) return res.status(404).json({ error: "Region not found" });
    res.json({ message: "Region deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete region" });
  }
};
