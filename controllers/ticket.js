const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.createTicket = async (req, res) => {
  try {
    const ticketData = req.body;

    if (ticketData.type === "support") {
      // Check if email is provided


      if (!ticketData.email) {
        return res
          .status(400)
          .json({ error: "Email is required for support tickets" });
      }

      // Look for user by email
      const user = await User.findOne({ email: ticketData.email });
      ticketData.user = user ? user._id : null;
    }

    const ticket = await Ticket.create(ticketData);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTicketsByType = async (req, res) => {
  try {
    const tickets = await Ticket.find({ type: req.params.type });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTicketsByEmail = async (req, res) => {
  try {
    const tickets = await Ticket.find({ email: req.params.email });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
