const express = require("express");
require("./config/connect");

const productroute = require('./routes/product');
const userroute = require('./routes/user');
const app = express();
app.use(express.json());


//http://127.0.0.1:3000/product/create 

app.use('/product',productroute)
app.use('/user',userroute)
app.use('/getimage',express.static('./uploads'))



app.listen(3000, () => {
  console.log("server work");

});
