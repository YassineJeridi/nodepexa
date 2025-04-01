const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const CasaAdmin = mongoose.model('CasaAdmin', {
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});


// Add password comparison method
CasaAdmin.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


// Remove password from JSON output
CasaAdmin.schema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

module.exports = CasaAdmin;