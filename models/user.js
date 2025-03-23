const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the User schema
const userSchema = new mongoose.Schema({
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  // Donor-specific fields
  fullname: {
    type: String,
    required: function () {
      return !this.isAnonymous;
    },
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return !this.isAnonymous;
    },
  },
  password: {
    type: String,
    required: function () {
      return !this.isAnonymous;
    },
  },
  phone: {
    type: String,
    required: function () {
      return !this.isAnonymous;
    },
  },
  address: {
    type: String,
    required: function () {
      return !this.isAnonymous;
    },
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  upgradeStatus: {
    type: Boolean,
    //default: false
  },
  isVolunteer: {
    type: Boolean,
    //default: false
  },
  // Volunteer-specific fields (filled by admin)
  badge: {
    type: String,
    enum: ["Bronze", "Silver", "Gold"],
  },
  association: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Association",
    required: function () {
      return this.upgradeStatus === true;
    },
  },

  VolunteerStatus: {
    type: String,
    enum: ["enabled", "disabled"],
    default: "disabled",
  },
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isAnonymous) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
