const Ticket = mongoose.model("Ticket", {
  email: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  dateTime: { 
    type: Date, 
    default: Date.now 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  type: {
    type: String,
    enum: ["support", "newsletter"],
    required: true
  }
});