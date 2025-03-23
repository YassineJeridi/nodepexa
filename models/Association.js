const mongoose = require("mongoose");

const Association = mongoose.model("Association", {
  name: {
    type: String,
    required: true,
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  partnershipDate: { 
    type: Date, 
    required: true 
  },
  partnershipDoc: { 
    type: String, 
    required: true 
  }, // Store file path/URL
});

module.exports = Association;
