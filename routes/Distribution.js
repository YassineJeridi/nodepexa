const express = require('express');
const router = express.Router();
const Distribution = require('../models/distribution'); // Adjust path as needed


// Create Distribution
router.post('/', async (req, res) => {
    try {
        const distribution = new Distribution({
            StartDate: req.body.StartDate,
            EndDate: req.body.EndDate,
            Status: req.body.Status,
            image: req.body.image,
            VolunteerId: req.body.VolunteerId,
            DonationBoxId: req.body.DonationBoxId
        });

        const savedDistribution = await distribution.save();
        res.status(201).json(savedDistribution);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update Distribution
router.put('/:id', async (req, res) => {
    try {
        const updatedDistribution = await Distribution.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    StartDate: req.body.StartDate,
                    EndDate: req.body.EndDate,
                    Status: req.body.Status,
                    image: req.body.image,
                    VolunteerId: req.body.VolunteerId,
                    DonationBoxId: req.body.DonationBoxId
                }
            },
            { new: true }
        );

        if (!updatedDistribution) {
            return res.status(404).json({ message: 'Distribution not found' });
        }
        res.json(updatedDistribution);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all Distributions
router.get('/', async (req, res) => {
    try {
        const distributions = await Distribution.find()
            .populate('VolunteerId')
            .populate('DonationBoxId');
        res.json(distributions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Distribution by ID
router.get('/:id', async (req, res) => {
    try {
        const distribution = await Distribution.findById(req.params.id)
            .populate('VolunteerId')
            .populate('DonationBoxId');

        if (!distribution) {
            return res.status(404).json({ message: 'Distribution not found' });
        }
        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Distribution by date
router.get('/date/:date', async (req, res) => {
    try {
        const targetDate = new Date(req.params.date);
        if (isNaN(targetDate)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const distributions = await Distribution.find({
            StartDate: {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            }
        }).populate('VolunteerId').populate('DonationBoxId');

        res.json(distributions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;