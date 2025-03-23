const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Association = require('../models/association');


// Configure file storage for partnership documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/partnershipDocs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// GET all associations
router.get('/', async (req, res) => {
  try {
    const associations = await Association.find();
    res.json(associations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single association
router.get('/:id', getAssociation, (req, res) => {
  res.json(res.association);
});

// CREATE association
router.post('/', upload.single('partnershipDoc'), async (req, res) => {
  const { name, description, location, partnershipDate } = req.body;
  
  if (!name || !description || !location || !partnershipDate || !req.file) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const association = new Association({
    name,
    description,
    location,
    partnershipDate,
    partnershipDoc: req.file.path
  });

  try {
    const newAssociation = await association.save();
    res.status(201).json(newAssociation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE association
router.patch('/:id', getAssociation, upload.single('partnershipDoc'), async (req, res) => {
  const { name, description, location, partnershipDate } = req.body;
  
  if (name) res.association.name = name;
  if (description) res.association.description = description;
  if (location) res.association.location = location;
  if (partnershipDate) res.association.partnershipDate = partnershipDate;
  
  if (req.file) {
    // Delete old file
    if (res.association.partnershipDoc) {
      fs.unlink(res.association.partnershipDoc, (err) => {
        if (err) console.error('Error deleting old file:', err);
      });
    }
    res.association.partnershipDoc = req.file.path;
  }

  try {
    const updatedAssociation = await res.association.save();
    res.json(updatedAssociation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE association
router.delete('/:id', getAssociation, async (req, res) => {
  try {
    // Delete associated file
    if (res.association.partnershipDoc) {
      fs.unlink(res.association.partnershipDoc, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    await res.association.remove();
    res.json({ message: 'Association deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get association by ID
async function getAssociation(req, res, next) {
  let association;
  try {
    association = await Association.findById(req.params.id);
    if (!association) {
      return res.status(404).json({ message: 'Association not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.association = association;
  next();
}

module.exports = router;