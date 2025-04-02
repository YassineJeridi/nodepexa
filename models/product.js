const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  image: {
    type: String,  // Path to the image file
    required: true
  }
});

module.exports = Product ;