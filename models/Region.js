const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // Relationship: Region 0..N — 0..N Stock
  stocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
    },
  ],
});

module.exports = mongoose.model("Region", RegionSchema);
