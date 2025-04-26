const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures product name is unique in the database
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // Path to the image file
    required: true,
  },
});

// Create index for unique constraint

module.exports = mongoose.model("Product", productSchema);
