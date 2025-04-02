const mongoose = require('mongoose');

const Association = mongoose.model('Association', {
  // _id: mongoose.Schema.Types.ObjectId, // Optional, MongoDB will generate an ID if not provided
  name: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  }, // Will be hashed
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  Description: String,
  Location: String,
  PartnershipDate: { 
    type: Date, 
    default: Date.now 
  },
  partnershipDoc: String, // File path/URL
  status: { 
    type: String, 
    enum: ['enabled', 'disabled'],  
    default: 'active' 
  },
});


module.exports = Association;