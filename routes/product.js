const express = require('express');
const router = express.Router();
const Product = require("./models/product");
// Product CRUD

router.post("/AddProduct", (req, res) => {
    data = req.body;
    prod = new Product(data);
    prod
      .save()
      .then((savedUser) => {
        res.status(200).send(savedUser);
      })
      .catch((err) => {
        res.status(400);
        send(err);
      });
  
    console.log("product added added");
  });
  
  router.get("/getallproducts", async (req, res) => {
    try {
      prod = await Product.find();
      res.status(200).send(prod);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  router.put("/UpdateProduct/:id", async (req, res) => {
    try {
      myid = req.params.id;
      data = req.body;
      update = await Product.findByIdAndUpdate({ _id: myid }, data);
      res.status(200).send(update);
      console.log("update product added");
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  router.delete("/DeleteProduct/:id", async (req, res) => {
    try {
      myid = req.params.id;
      deleted = await Product.findByIdAndDelete({ _id: myid });
      res.status(200).send(deleted);
    } catch (error) {
      res.status(400).send(error);
    }
  }); 

module.exports = router;