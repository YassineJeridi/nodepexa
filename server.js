const express = require("express");
require("./config/connect");
require('dotenv').config();
const authMiddleware = require('./middlewares/authMiddleware');

const isAdmin = require('./middlewares/isAdmin');
const isAssociation = require('./middlewares/isAssociation');
const adminDashboardRoute = require('./routes/adminDashboard'); // Add this line
const associationDashboardRoute = require('./routes/associationDashboard'); // Add this line




const userRoute = require('./routes/User');
const productRoute = require('./routes/Product');
const ticketRoute = require('./routes/Ticket');
const AssociationRoute = require('./routes/Association');
const ActivityLogRoute = require('./routes/ActivityLog');
const CasaAdminRoute = require('./routes/CasaAdmin');
const distributionRoute = require('./routes/Distribution');
const DonationBoxRoute = require('./routes/DonationBox');
const authenticationRoute = require('./routes/auth');


const app = express();
app.use(express.json());


app.use('/user',userRoute);  
app.use('/product',productRoute);
app.use('/ticket',ticketRoute);
app.use('/association',AssociationRoute);
app.use('/activitylog',ActivityLogRoute);
app.use('/casaadmin',CasaAdminRoute);
app.use('/distribution',distributionRoute);
app.use('/donationbox',DonationBoxRoute);
app.use('/auth',authenticationRoute);
app.use('/user', authMiddleware, userRoute);



app.use('/admin/dashboard', authMiddleware, isAdmin, adminDashboardRoute);
app.use('/association/dashboard', authMiddleware, isAssociation, associationDashboardRoute);


app.listen(3000, () => {
  console.log("server work");

});
