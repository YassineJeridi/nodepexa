const mongoose = require("mongoose");

const Donation = mongoose.model("Donation", {
  box: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Box", 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    required: true,
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date 
  },
});


module.exports = Donation ;
