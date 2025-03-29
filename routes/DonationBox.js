const express = require('express');
const router = express.Router();
const DonationBox = require('../models/donationBox'); // Adjust path as needed

// Create DonationBox
router.post('/', async (req, res) => {
    try {
        const donationBox = new DonationBox({
            Items: req.body.Items,
            region: req.body.region,
            Price: req.body.Price,
            Status: req.body.Status,
            StartDate: req.body.StartDate,
            EndDate: req.body.EndDate,
            UserId: req.body.UserId
        });

        const savedDonationBox = await donationBox.save();
        res.status(201).json(savedDonationBox);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all DonationBoxes
router.get('/', async (req, res) => {
    try {
        const donationBoxes = await DonationBox.find()
            .populate('UserId')
            .populate('Items.ProductID');
        res.json(donationBoxes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get DonationBox by ID
router.get('/:id', async (req, res) => {
    try {
        const donationBox = await DonationBox.findById(req.params.id)
            .populate('UserId')
            .populate('Items.ProductID');

        if (!donationBox) {
            return res.status(404).json({ message: 'DonationBox not found' });
        }
        res.json(donationBox);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get DonationBox by date
router.get('/date/:date', async (req, res) => {
    try {
        const targetDate = new Date(req.params.date);
        if (isNaN(targetDate)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const donationBoxes = await DonationBox.find({
            StartDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        })
        .populate('UserId')
        .populate('Items.ProductID');

        res.json(donationBoxes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get DonationBox by User
router.get('/user/:userId', async (req, res) => {
    try {
        const donationBoxes = await DonationBox.find({ UserId: req.params.userId })
            .populate('UserId')
            .populate('Items.ProductID');
            
        res.json(donationBoxes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;