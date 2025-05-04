// server.j
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/database"); // Import database connection
const authRoutes = require("./routes/auth");
const associationRoutes = require("./routes/Association");
const donationBoxRoutes = require("./routes/DonationBox");
const productRoutes = require("./routes/Product");
const ticketRoutes = require("./routes/Ticket");
const userRoutes = require("./routes/User");
const dashboardRouter = require("./routes/AdminDashboardRouter");

const statsRoutes = require("./routes/stats");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/associations", associationRoutes);
app.use("/api/donationBoxes", donationBoxRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api", statsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin/dashboard", dashboardRouter);
// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.MONGO_URI}`);
});
