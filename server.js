const express = require("express");
const Product = require("./models/product");
require("./config/connect");

const Productroute = require('./routes/product');
const userroute = require('./routes/user');
const app = express();
app.use(express.json());


//http://127.0.0.1:3000/product/





app.listen(3000, () => {
  console.log("server work");

});
