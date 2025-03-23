// User Model (For donation tracking)
const User = mongoose.model("User", {
    isAnonymous: { type: Boolean, required: true }
  });
  
  // Donor Model (Registered users)
  const Donor = mongoose.model("Donor", {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    joinDate: { type: Date, default: Date.now },
    upgradeStatus: { type: Boolean, default: false },
    isVolunteer: { type: Boolean, default: false }
  });
  
  
  const Volunteer = mongoose.model("Volunteer", {
    badge: {
      type: String,
      enum: ["iron", "Bronze", "Silver", "Gold"],
      required: true
    },
    association: { type: mongoose.Schema.Types.ObjectId, ref: "Association", required: true },
    status: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled"
    }
  });