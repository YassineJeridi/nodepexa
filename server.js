const express = require("express");
require("./config/connect");



const ticketRoute = require('./routes/Ticket');
const adminRoutes = require('./routes/admin');
const activityLogRoute = require('./routes/ActivityLog');
const AssociationRoute = require('./routes/Association');
const userRoute = require('./routes/User');
const productRoute = require('./routes/Product');
const DonationBoxRoute = require('./routes/DonationBox');
const DistributionRoute = require('./routes/Distribution');



const app = express();
app.use(express.json());



app.use('/ticket', ticketRoute);
app.use('/admin', adminRoutes);
app.use('/ActivityLogs', activityLogRoute);
app.use('/Association', AssociationRoute);
app.use('/user',userRoute);  
app.use('/product',productRoute);
app.use('/DonationBox', DonationBoxRoute);
app.use('/Distribution', DistributionRoute);




app.use('/getimage',express.static('./uploads'))

app.listen(3000, () => {
  console.log("server work");

});
