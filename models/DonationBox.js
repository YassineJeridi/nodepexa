const mongoose = require("mongoose");

const donationBoxSchema = new mongoose.Schema({
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  region: {
    type: String,
},
  price: {
    type: Number,
    required: true,
    min: 0, // Ensure non-negative values
  },

  boxStatus: {
    type: String,
    enum: ["Collecting", "Completed", "Cancelled", "Picked", "Distributed"],
  },
  timeTrack: {
    creation: {
      type: Date,
      default: Date.now,
    },
    checkout: Date,
    picking: Date,
    close: Date,
  },
  image: String,
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("DonationBox", donationBoxSchema);
