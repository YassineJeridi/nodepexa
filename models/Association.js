const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Association = mongoose.model('Association', {
  AssociationID: { 
    type: String, 
    required: true, 
    unique: true 
  },
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
  partnershipDoc: String // File path/URL
});

// Add password hashing middleware
Association.schema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = Association;