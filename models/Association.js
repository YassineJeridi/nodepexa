// models/Association.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const associationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  address: {
    type: String,
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  description: String,
  partnershipDate: {
    type: Date,
    default: Date.now,
  },
  partnershipDoc: {
    type: String,
    required: true,
  },
});

// Password hashing for associations
associationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

associationSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports =
  mongoose.models.Association ||
  mongoose.model("Association", associationSchema);
