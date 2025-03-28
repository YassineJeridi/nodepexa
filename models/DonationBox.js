const mongoose = require('mongoose');

const DonationBox = mongoose.model('DonationBox', {
    // Donation Box fields
    Items: [{
        ProductID: {
            type: String,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    region: {
        type: String,
    },
    Price: {
        type: Number,
        required: true
    },
    Status: {
        type: String,
        enum: ['collecting', 'Pending', 'Completed', 'Cancelled'],
        default: 'collecting',
        required: true
    },
    StartDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    EndDate: {
        type: Date,
    },
    // Relationship with User
    UserId: {
        type: String,
        ref: 'User',
        required: true
    }
});

module.exports = DonationBox;