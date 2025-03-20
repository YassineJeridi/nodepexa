const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// user CRUD


router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    
    // Handle Anonymous Users
    if (data.isAnonymous) {
      // Validate anonymous user structure
      if (Object.keys(data).some(key => !['userId', 'isAnonymous'].includes(key))) {
        return res.status(400).send({ 
          message: 'Anonymous users can only provide userId and isAnonymous' 
        });
      }

      const anonymousUser = new User({
        userId: data.userId,
        isAnonymous: true
      });

      await anonymousUser.save();
      return res.status(201).send(anonymousUser);
    }
    // Handle Registered Users
    else {
      // Validate required fields
      const requiredFields = ['name', 'lastname', 'email', 'password', 'phone', 'address'];
      const missingFields = requiredFields.filter(field => !data[field]);

      if (missingFields.length > 0) {
        return res.status(400).send({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Create registered user (password hashing handled in model middleware)
      const newUser = new User({
        userId: data.userId,
        isAnonymous: false,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        password: data.password, // Will be hashed automatically
        phone: data.phone,
        address: data.address
      });

      await newUser.save();

      // Remove password from response
      const userResponse = newUser.toObject();
      delete userResponse.password;
      return res.status(201).send(userResponse);
    }

  } catch (error) {
    console.error('Registration Error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).send({
        message: `${duplicateField} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).send({
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    // Generic error handler
    res.status(500).send({ message: 'Server error during registration' });
  }
});


router.post('/login',async(req,res)=>{
    data = req.body;
    user = await User.findOne({email:"yassinejeridi23@gmail.com"});
    if(!user){
        res.status(404).send("user not found");
    }
    else{
        const valid = await bcrypt.compareSync(data.password,user.password);
        if(!valid){
            res.status(401).send("email or password invalid");
        }
        else{
            payload = {
                _id:user._id,
                email:user.email,
                name:user.name
            }
            token = jwt.sign(payload,'1234567')
            res.status(200).send({mytoken : token});
            
        }
    }
})








router.post("/create", async (req, res) => {
  try {
    data = req.body;
    usr = new User(data);

    savedUser = await usr.save();

    res.send(savedUser);
  } catch (error) {
    res.send(error);
  }
});

router.get("/getall", (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/all", async (req, res) => {
  try {
    users = await User.find();
    res.send(users);
  } catch (error) {
    res.send(error);
  }
});

router.get("/filter", async (req, res) => {
  try {
    users = await User.find({ age: 21, name: "ela" });
    res.send(users);
  } catch (error) {
    res.send(error);
  }
});

router.get("/findbyid/:id", (req, res) => {
  myid = req.params.id;
  User.findById(myid)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/findone/:id", async (req, res) => {
  try {
    myid = req.params.id;
    users = await User.findOne({ _id: myid });
    res.send(users);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/delete/:id", (req, res) => {
  myid = req.params.id;
  User.findOneAndDelete({ _id: myid })
    .then((deletedUser) => {
      res.send(deletedUser);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.delete("/delete2/:id", async (req, res) => {
  try {
    myid = req.params.id;
    deleteduser = await User.findByIdAndDelete(myid);
    res.send(deleteduser);
  } catch (error) {
    res.send(error);
  }
});

router.put("/update/:id", (req, res) => {
  myid = req.params.id;
  data = req.body;
  User.findOneAndUpdate({ _id: myid }, data)
    .then((updateduser) => {
      res.send(updateduser);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.put("/update2/:id", async (req, res) => {
  try {
    myid = req.params.id;
    data = req.body;
    update = await User.findByIdAndUpdate({ _id: myid }, data);
    res.send(update);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
