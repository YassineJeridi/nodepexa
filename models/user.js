const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const User = mongoose.model('User', {
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  role: {
    type: String, 
    enum: ['donor', 'volunteer'], 
    required: true 
  },

  // Donor fields
  fullname: { 
    type: String, 
    required:  () => !this.isAnonymous 
  },
  email: { 
    type: String, 
    required:  () => !this.isAnonymous 
  },
  password: { 
    type: String, 
    required:  () => !this.isAnonymous 
  },
  phone: {
    type : String,
    required:  () => !this.isAnonymous 
  },
  address: {
    type :String,    
    required:  () => !this.isAnonymous 
  },
  upgradeStatus: {
    type:Boolean,
    default: false,
    required:  () => !this.isAnonymous},

  // Volunteer fields
  badge: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold'] ,
    required: function() { 
      if ( this.role == 'volunteer' ) {
        return true;
      }
    }
  },
  association: { 
    type: mongoose.Types.ObjectId, 
    ref: 'Association' ,
    required: function() { 

        return  this.upgradeStatus === true; 
    }
  },
  VolunteerStatus: { 
    type: String, 
    enum: ['enabled', 'disabled'], 
    default: 'disabled' 

  }
});

// Password hashing
User.schema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison
User.schema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;