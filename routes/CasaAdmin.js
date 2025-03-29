const express = require('express');
const router = express.Router();
const CasaAdmin = require("../models/CasaAdmin"); // Match renamed model file

// CREATE Admin
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newAdmin = new CasaAdmin({ name });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET All Admins
router.get('/', async (req, res) => {
  try {
    const admins = await CasaAdmin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET Admin by Name
router.get('/:name', async (req, res) => {
  try {
    const admin = await CasaAdmin.findOne({ name: req.params.name });
    admin ? res.json(admin) : res.status(404).json({ error: "Admin not found" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE Admin
router.put('/:id', async (req, res) => {
  try {
    const updatedAdmin = await CasaAdmin.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    updatedAdmin ? res.json(updatedAdmin) : res.status(404).json({ error: "Admin not found" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE Admin
router.delete('/:id', async (req, res) => {
  try {
    const deletedAdmin = await CasaAdmin.findByIdAndDelete(req.params.id);
    deletedAdmin ? res.json({ message: "Admin deleted" }) : res.status(404).json({ error: "Admin not found" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;