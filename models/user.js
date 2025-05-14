const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["Anonymous", "Donor", "Volunteer", "Admin"],
    required: true,
  },
  fullName: {
    type: String,
    required: function () {
      return this.role !== "Anonymous";
    },
  },
  email: {
    type: String,
    unique: true,
    required: function () {
      return this.role !== "Anonymous" && this.role !== "Admin";
    },
    sparse: true,
  },
  password: {
    type: String,
    required: function () {
      return this.role !== "Anonymous";
    },
  },
  phone: {
    type: String,
    required: function () {
      return this.role !== "Anonymous" && this.role !== "Admin";
    },
    unique: true,
    sparse: true,
  },

  address: {
    type: String,
    required: function () {
      return this.role !== "Anonymous" && this.role !== "Admin";
    },
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  rewardPoints: {
    type: Number,
    min: 0,
    required: function () {
      return this.role !== "Anonymous" && this.role !== "Admin";
    },
    default: 0,
  },

  requestedAssociation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Association",
  },

  badge: {
    type: String,
    enum: ["Iron", "Bronze", "Silver", "Gold"],
    required: function () {
      return this.role === "Volunteer";
    },
  },
  associatedAssociation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Association",
    required: function () {
      return this.role === "Volunteer";
    },
  },
  userStatus: {
    type: String,
    enum: ["enabled", "disabled"],
    default: "enabled",
  },
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  // Handle password hashing
  if (this.role !== "Anonymous" && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();

  if (this.role === "Anonymous" || this.role === "Admin") {
    this.rewardPoints = undefined; // Remove password for anonymous users
  }
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
