const UserActivityLog = mongoose.model("UserActivityLog", {
  user: {  
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  association: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Association" 
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin" 
  },
  activityType: {
    type: String,
    enum: [
      "DONATION_MADE", "DONATION_UPDATED", "DONATION_CANCELLED",
      "ACCOUNT_CREATED", "ACCOUNT_UPDATED", "LOGIN", "LOGOUT",
      "SUPPORT_TICKET_SENT", "DONATION_APPROVED", "DONATION_REJECTED",
      "USER_ACCOUNT_SUSPENDED", "USER_ACCOUNT_REACTIVATED",
      "SUPPORT_TICKET_RESOLVED", "PRODUCT_ADDED", "PRODUCT_UPDATED",
      "PRODUCT_REMOVED", "ASSOCIATION_APPROVED", "ASSOCIATION_REJECTED",
      "DONATION_RECEIVED", "DONATION_DISTRIBUTED", "VOLUNTEER_ASSIGNED",
      "VOLUNTEER_REMOVED", "PARTNERSHIP_REQUESTED", "PARTNERSHIP_RENEWED",
      "PARTNERSHIP_TERMINATED", "TASK_ASSIGNED", "TASK_COMPLETED",
      "TASK_UPDATED", "TASK_CANCELLED", "DONATION_DELIVERED",
      "SYSTEM_ERROR", "NOTIFICATION_SENT", "REPORT_GENERATED"
    ],
    required: true
  },
  activityDescription: { 
    type: String, 
    required: true 
  },
  time: { 
    type: Date, 
    default: Date.now 
  }
});