const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Association = require('../models/Association');

// Configure file storage for partnership documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create directory if it doesn't exist
    const dir = 'uploads/partnershipDocs/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Middleware to handle file upload errors
const handleUpload = (req, res, next) => {
  upload.single('partnershipDoc')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

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

// CREATE association (with file upload)
router.post('/', handleUpload, async (req, res) => {
  const { name, description, location, partnershipDate } = req.body;
  console.log(req.body);
  
  if (!name || !description || !location || !partnershipDate || !req.file) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const association = new Association({
      name,
      description,
      location,
      partnershipDate,
      partnershipDoc: req.file.path
    });

    const newAssociation = await association.save();
    res.status(201).json(newAssociation);
  } catch (err) {
    // Clean up file if save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: err.message });
  }
});

// UPDATE association (full update with optional file upload)
router.put('/:id', handleUpload, async (req, res) => {
  const { name, description, location, partnershipDate } = req.body;
  const { id } = req.params;

  if (!name || !description || !location || !partnershipDate) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const association = await Association.findById(id);
    if (!association) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Association not found' });
    }

    // Delete old file if it exists and new file is uploaded
    if (association.partnershipDoc && req.file) {
      fs.unlinkSync(association.partnershipDoc);
    }

    const updatedAssociation = await Association.findByIdAndUpdate(
      id,
      {
        name,
        description,
        location,
        partnershipDate,
        partnershipDoc: req.file ? req.file.path : association.partnershipDoc
      },
      { new: true }
    );

    res.json(updatedAssociation);
  } catch (err) {
    // Clean up file if update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE association
router.delete('/:id', getAssociation, async (req, res) => {
  try {
    const association = res.association;
    
    // Delete associated file if it exists
    if (association.partnershipDoc) {
      try {
        fs.unlinkSync(association.partnershipDoc);
      } catch (fileErr) {
        console.error('File deletion error:', fileErr);
        // Continue with deletion even if file can't be removed
      }
    }

    // Delete from database
    await Association.deleteOne({ _id: association._id });
    
    res.json({ 
      message: 'Association deleted successfully',
      deletedAssociation: association
    });
    
  } catch (err) {
    console.error('Deletion error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid association ID' });
    }
    
    res.status(500).json({ 
      message: 'Failed to delete association',
      error: err.message 
    });
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