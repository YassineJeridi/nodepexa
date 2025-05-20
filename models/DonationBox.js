//models/DonationBox.js
const mongoose = require("mongoose");


const donationBoxSchema = new mongoose.Schema({
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: function () {
      return this.boxStatus !== "Collecting";
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensure non-negative values
  },

  boxStatus: {
    type: String,
    enum: ["Collecting", "Checkout", "Cancelled", "Picked", "Distributed"],
  },
  timeTrack: {
    Collecting: {
      type: Date,
      default: Date.now,
    },
    Checkout: {
      type: Date,
    },

    Cancelled: {
      type: Date,
    },
    Picked: {
      type: Date,
    },
    Distributed: {
      type: Date,
    },
  },
  image: String,
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("DonationBox", donationBoxSchema);
