const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: function () {
      return this.type === "support";
    },
  },
  dateTime: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["support", "newsletter"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
