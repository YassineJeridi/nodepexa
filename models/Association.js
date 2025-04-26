const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const associationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  description: String,
  location: String,
  partnershipDate: {
    type: Date,
    default: Date.now, // Auto-set partnership date
  },
  partnershipDoc: String,
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

module.exports = mongoose.model("Association", associationSchema);
