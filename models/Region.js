const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  stocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
    },
  ],
});

module.exports = mongoose.model("Region", RegionSchema);
