const mongoose = require("mongoose");

const CasaAdmin = mongoose.model("CasaAdmin", {
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

  module.exports = CasaAdmin ;
  