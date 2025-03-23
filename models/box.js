const mongoose = require("mongoose");

const Box = mongoose.model("Box", {
  donation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Donation", 
    required: true 
  },
  user: {    
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
    }
  }],
  region: { 
    type: String, 
    required: true 
  }
});

module.exports = Box ;