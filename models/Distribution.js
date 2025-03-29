const mongoose = require('mongoose');

const Distribution = mongoose.model('Distribution', {

  StartDate: {
    type : Date,
    default: Date.now,
    required: true
},
  EndDate: Date,
  Status: {
      type: String,
      enum: ['pending', 'associated', 'picked', 'distributed'],
      default: 'pending',
      required: true
  },
  image : {
    type: String,
    required: () => this.Status === 'distributed'
  },
  // Relationships
  VolunteerId: {
      type: String,
      ref: 'User'
  },
  DonationBoxId: {
      type: String,
      ref: 'DonationBox',
      required: true
  }
});
module.exports = Distribution;