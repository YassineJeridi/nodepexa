const Product = require("../models/Product");
const fs = require("fs");

exports.createProduct = async (req, res) => {
  try {
    // Check for existing product first
    const existingProduct = await Product.findOne({ name: req.body.name });
    if (existingProduct) {
      // Delete the uploaded file if name exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Product name already exists" });
    }

    // Create product if name is unique
    const product = await Product.create({
      ...req.body,
      image: req.file.path,
    });

    res.status(201).json(product);
  } catch (error) {
    // Cleanup file on any error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get product by name
exports.getProductByName = async (req, res) => {
  try {
    const products = await Product.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;

    // ✅ Validate required fields
    if (!name || !description || !price || !quantity) {
      return res
        .status(400)
        .json({
          error: "All fields including image are required for PUT updates",
        });
    }
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
    };
    if (req.file) {
      updateData.image = req.file.path;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    // Delete product and get its data
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete image if it exists
    if (product.image) {
      if (fs.existsSync(product.image)) {
        fs.unlinkSync(product.image);
      }
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
