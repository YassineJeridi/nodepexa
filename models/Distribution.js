const mongoose = require("mongoose");

const Distribution = mongoose.model("Distribution", {
  volunteer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Volunteer", 
    required: true 
  },
  box: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Box", 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date 
  }
});

module.exports = Distribution ;