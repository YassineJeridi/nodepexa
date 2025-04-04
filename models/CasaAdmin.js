// models/CasaAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 1. Define Schema
const casaAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // ⚠️ Ensure admin names are unique
  },
  password: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    default: Date.now,
    immutable: true // Prevent modification after creation
  },
  isSuperAdmin: { // ⚠️ Optional: For tiered admin access
    type: Boolean,
    default: false
  }
});

// 2. Password Hashing (pre-save hook)
casaAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 3. Password Comparison Method
casaAdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 4. Remove Password from JSON Output
casaAdminSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

// 5. Create Model
const CasaAdmin = mongoose.model('CasaAdmin', casaAdminSchema);

module.exports = CasaAdmin;