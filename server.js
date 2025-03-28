const express = require("express");
require("./config/connect");



const ticketRoute = require('./routes/Ticket');
const adminRoutes = require('./routes/admin');
const activityLog = require('./routes/ActivityLog');
const AssociationRoute = require('./routes/Association');
const userRoute = require('./routes/User');
const productRoute = require('./routes/Product');
const DonationBox = require('./routes/DonationBox');
const Distribution = require('./routes/Distribution');



const app = express();
app.use(express.json());



app.use('/ticket', ticketRoute);
app.use('/admin', adminRoutes);
app.use('/ActivityLogs', activityLog);
app.use('/Association', AssociationRoute);
app.use('/user',userRoute);  
app.use('/product',productRoute);
app.use('/DonationBox', DonationBox);
app.use('/Distribution', Distribution);




app.use('/getimage',express.static('./uploads'))

app.listen(3000, () => {
  console.log("server work");

});
