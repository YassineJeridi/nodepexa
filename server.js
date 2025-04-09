const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/database");

// Middlewares
const authMiddleware = require("./middlewares/authMiddleware");
const isAdmin = require("./middlewares/isAdmin");


// Routes
const userRoute = require("./routes/User");
const productRoute = require("./routes/Product");
const ticketRoute = require("./routes/Ticket");
const AssociationRoute = require("./routes/Association");
const ActivityLogRoute = require("./routes/ActivityLog");
const CasaAdminRoute = require("./routes/CasaAdmin");
const distributionRoute = require("./routes/Distribution");
const DonationBoxRoute = require("./routes/DonationBox");
const authenticationRoute = require("./routes/auth");
const adminDashboardRoute = require("./routes/adminDashboard");

// Initialize Express app


//test
const app = express();

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Route Definitions
const routes = [
  { path: "/auth", route: authenticationRoute },
  { path: "/user", route: userRoute, middleware: [authMiddleware] },
  { path: "/product", route: productRoute },
  { path: "/ticket", route: ticketRoute },
  { path: "/association", route: AssociationRoute },
  { path: "/activitylog", route: ActivityLogRoute },
  { path: "/distribution", route: distributionRoute },
  { path: "/donationbox", route: DonationBoxRoute },
  { path: "/casaadmin", route: CasaAdminRoute },
  { 
    path: "/admin/dashboard", 
    route: adminDashboardRoute, 
    middleware: [authMiddleware, isAdmin] 
  }
];

// Register Routes
routes.forEach(({ path, route, middleware = [] }) => {
  app.use(path, ...middleware, route);
});

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});