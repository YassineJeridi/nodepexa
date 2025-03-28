const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// CREATE Ticket

router.post('/', async (req, res) => {
  try {
    const { email, message, type, user } = req.body;
    
    // Updated validation
    if (!email || !type) {
      return res.status(400).json({ message: 'Email and type are required' });
    }

    // Additional check for support tickets
    if (type === 'support' && !message) {
      return res.status(400).json({ message: 'Message is required for support tickets' });
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
    // Handle validation errors
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

// GET Single Ticket by ID
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

// DELETE Ticket
router.delete('/:id', async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);

    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ 
      message: 'Ticket deleted successfully',
      deletedTicket
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;