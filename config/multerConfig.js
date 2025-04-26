const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  partnershipDocs: 'uploads/partnershipDocs',
  productImages: 'uploads/ProductImages'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Product Image Storage
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.productImages),
  filename: (req, file, cb) => {
    const productName = req.body.name.replace(/\s+/g, '-');
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${productName}_${date}${path.extname(file.originalname)}`);
  }
});

// PDF Storage
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirs.partnershipDocs),
  filename: (req, file, cb) => {
    // Fallback for missing name
    const name = req.body?.name || 'unknown_association';
    const safeName = name.toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${safeName}_${date}${path.extname(file.originalname)}`);
  }
});

// File Filters
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed!'), false);
};

// Export middleware
module.exports = {
  uploadProductImage: multer({ 
    storage: productImageStorage,
    fileFilter: imageFilter
  }).single('image'),

  uploadPartnershipDoc: multer({ 
    storage: pdfStorage,
    fileFilter: pdfFilter
  }).single('partnershipDoc')
};