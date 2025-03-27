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
    required: () => !this.isAnonymous 
  },
  // Donor fields
  fullname: { 
    type: String, 
    required: function() { 
      if ( this.role === 'donor' || this.role === 'volunteer' ) {
        return true;
    } 
  }},
  email: { 
    type: String, 
    required: function() { 
      if ( this.role === 'donor' || this.role === 'volunteer' ) {
        return true;
    }} ,
    unique: true 
  },
  password: { 
    type: String, 
    required: function() { 
      if ( this.role === 'donor' || this.role === 'volunteer' ) {

        return true;

    }} ,
  },
  phone: {
    type : String,
    required: function() { 
      if ( this.role === 'donor' || this.role === 'volunteer' ) {

        return true;

      }
    }
  },
  address: String,
  upgradeStatus: Boolean,
  // Volunteer fields
  badge: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold'] ,
    required: function() { 
      if ( this.role === 'volunteer' ) {
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
    default: 'enabled' 

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