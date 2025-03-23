const express = require('express');
const router = express.Router();
const Product = require("../models/Product");
const multer = require('multer');

filename = '';

const mystorage = multer.diskStorage({
    destination: './uploads',
    filename : (req, file, redirect)=>{
        let date = Date.now();
        //image/png
        let fl = date+'.'+ file.mimetype.split('/')[1];
        redirect(null,fl);
        filename = fl;

    }
})


const upload = multer({storage:mystorage});

// Product CRUD

router.post("/AddProduct", upload.any('image') ,async(req, res) => {
try {
    data = req.body;
    prod = new Product(data);
    prod.image = filename;
    savedproduct = await prod.save();
    res.send(savedproduct);
    filename = '';
    
} catch (error) {
    console.log(error);
    res.status(400).send(error);
    
}
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