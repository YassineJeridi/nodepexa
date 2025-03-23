const mongoose = require("mongoose");

const Admin = mongoose.model("Admin", {
    name: { 
        type: String, 
        required: true 
    },
    joiningDate: { 
        type: Date, 
        default: Date.now ,
        required: true 
    }
  });

  module.exports = Admin ;
  