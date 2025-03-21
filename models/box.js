const donationSchema = new Schema({
    donationId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
  });