const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const User = mongoose.model('User', {
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  role: {
    type: String, 
    enum: ['anonymous', 'donor', 'volunteer'],  // Added 'anonymous' here
    required: true 
  },
  
  // Make all donor fields conditionally required
  fullname: { 
    type: String, 
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; } 
  },
  email: { 
    type: String, 
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; } ,
    unique: true
  },
  password: { 
    type: String, 
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; }   
  },
  phone: {
    type: String,
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; } 
  },
  address: {
    type: String,    
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; } 
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: true },
  upgradeStatus: {
    type: String,
    enum: ['enabled', 'disabled'],
    default: function() { 
      if (this.role === 'donor' || this.role === 'volunteer') {
        return 'disabled';
      }
    },
    required:  function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; } 
  },
  UserStatus: {
    type: String,
    enum: ['enabled', 'disabled'],
    default: function() { 
      if (this.role === 'donor' || this.role === 'volunteer') {
        return 'enabled';
      }
    },
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; }
  },

  // Volunteer fields
  badge: { 
    type: String, 
    enum: ['no badge yet','bronze', 'silver', 'gold'] ,
    required: function() { 
      if ( this.role == 'volunteer' ) {
        return true;
      }
    }
  },
  association: { 
    type: mongoose.Types.ObjectId, 
    ref: 'Association', 
    required: function() { 
        return  this.upgradeStatus === true; 
    }
  },
  VolunteerStatus: { 
    type: String, 
    enum: ['enabled', 'disabled'], 
    default: function() { 
      if (this.role === 'donor') {
        return 'disabled';
      }
    } ,
    required: function() { return !this.isAnonymous && (this.role === 'donor' || this.role === 'volunteer' ) ; }

  }
});


const userSchema = User.schema;

// Add pre-save hook
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Add compare method
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;