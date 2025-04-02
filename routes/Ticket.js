const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User'); // Add this line
// CREATE Ticket

router.post('/', async (req, res) => {
  try {
    const { email, message, type, user } = req.body;
    
    // Basic validation
    if (!email || !type) {
      return res.status(400).json({ message: 'Email and type are required' });
    }

    // Support ticket validation
    if (type === 'support' && !message) {
      return res.status(400).json({ message: 'Message is required for support tickets' });
    }

    // Validate user exists if provided
    if (user) {
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    const newTicket = new Ticket({
      email,
      message,
      type,
      user: user || null
    });

    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: err.message.replace('Ticket validation failed: ', '') 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


// GET All Tickets (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { type, email } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (email) filter.email = email;

    const tickets = await Ticket.find(filter)
      .sort({ dateTime: -1 }) // Newest first
      .populate('user', 'username email'); // Optional user data

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});




router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['support', 'newsletter'].includes(type)) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    const tickets = await Ticket.find({ type })
      .sort({ dateTime: -1 })
      .populate('user', 'username email');

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});




router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'username email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});





router.get('/user/:userId', async (req, res) => {
  try {
    // Verify user exists first
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tickets = await Ticket.find({ user: req.params.userId })
      .sort({ dateTime: -1 })
      .populate('user', 'username email');

    res.json(tickets);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});






router.get('/username/:username', async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({ fullname: req.params.fullname });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tickets = await Ticket.find({ user: user._id })
      .sort({ dateTime: -1 })
      .populate('user', 'username email');

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;