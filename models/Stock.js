const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  reservedQtt: {
    type: Number,
    required: true,
    min: 0,
  },
  // Relationships (0..N — 0..N with Region and Product)
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

module.exports = mongoose.model("Stock", StockSchema);
