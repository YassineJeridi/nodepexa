const express = require("express");
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  deleteTicket,
  getTicketsByEmail,
  getTicketsByType,
} = require("../controllers/ticket");

router.post("/", createTicket);
router.get("/", getAllTickets);
router.get("/email/:email", getTicketsByEmail);
router.get("/type/:type", getTicketsByType);
router.delete("/:id", deleteTicket);

module.exports = router;
