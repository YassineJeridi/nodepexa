const mongoose = require("mongoose");

const Ticket = mongoose.model("Ticket", {
  email: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: function() { 
      return this.type === 'support'; // Required only for support tickets
    } 
  },
  dateTime: { 
    type: Date, 
    default: Date.now 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  type: {
    type: String,
    enum: ["support", "newsletter"],
    required: true
  }
});


module.exports = Ticket;