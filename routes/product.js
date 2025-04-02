const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../uploads/productUpload');
const fs = require('fs');

// Create Product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image: req.file.path
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(400).json({ error: error.message });
  }
});

// Update Product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price ? parseFloat(req.body.price) : product.price;
    product.quantity = req.body.quantity ? parseInt(req.body.quantity) : product.quantity;

    // Update image if new one was uploaded
    if (req.file) {
      // Delete old image
      if (product.image) {
        fs.unlink(product.image, () => {});
      }
      product.image = req.file.path;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(400).json({ error: error.message });
  }
});


// Delete Product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated image file
    if (product.image) {
      fs.unlink(product.image, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



// List all Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Product by name
router.get('/name/:name', async (req, res) => {
  try {
    const product = await Product.findOne({ name: req.params.name });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;