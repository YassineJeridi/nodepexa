const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  role: {
    type: String, 
    enum: ['anonymous', 'donor', 'volunteer'],
    required: true 
  },
  fullname: { 
    type: String, 
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    } 
  },
  email: { 
    type: String, 
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    },
    unique: true
  },
  password: { 
    type: String, 
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    }   
  },
  phone: {
    type: String,
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    } 
  },
  address: {
    type: String,    
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    } 
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  upgradeStatus: {
    type: String,
    enum: ['enabled', 'disabled'],
    default: 'disabled',
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    } 
  },
  UserStatus: {
    type: String,
    enum: ['enabled', 'disabled'],
    default: 'enabled',
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    }
  },
  badge: { 
    type: String, 
    enum: ['no badge yet', 'bronze', 'silver', 'gold'],
    required: function() { 
      return this.role === 'volunteer';
    }
  },
  association: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Association', 
    required: function() { 
      return this.upgradeStatus === 'enabled';
    }
  },
  VolunteerStatus: { 
    type: String, 
    enum: ['enabled', 'disabled'], 
    default: 'disabled',
    required: function() { 
      return !this.isAnonymous && ['donor', 'volunteer'].includes(this.role);
    }
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isAnonymous) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isAnonymous) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;