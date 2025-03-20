const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // REQUIRED FOR ALL USERS

  isAnonymous: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  },

  // FIELDS ONLY FOR REGISTERED USERS
  name: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  lastname: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls
    required: function() { return !this.isAnonymous; }
  },
  password: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  phone: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  address: {
    type: String,
    required: function() { return !this.isAnonymous; }
  }
});

// Validation: Anonymous users can't have registered user fields
userSchema.pre('validate', function(next) {
  if (this.isAnonymous) {
    const forbiddenFields = ['name', 'lastname', 'email', 'password', 'phone', 'address'];
    const hasForbiddenField = forbiddenFields.some(field => this[field] !== undefined);

    if (hasForbiddenField) {
      return next(new Error('Anonymous users cannot have personal information fields'));
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);