const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const associationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
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

// Hash password before saving
associationSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
associationSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
associationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('Association', associationSchema);