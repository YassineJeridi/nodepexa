const express = require("express");
require("./config/connect");
require('dotenv').config()


const userRoute = require('./routes/User');
const productRoute = require('./routes/Product');
const ticketRoute = require('./routes/Ticket');
const AssociationRoute = require('./routes/Association');
const ActivityLogRoute = require('./routes/ActivityLog');
const CasaAdminRoute = require('./routes/CasaAdmin');
const distributionRoute = require('./routes/Distribution');
const DonationBoxRoute = require('./routes/DonationBox');





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






app.use('/getimage',express.static('./uploads'))

app.listen(3000, () => {
  console.log("server work");

});
