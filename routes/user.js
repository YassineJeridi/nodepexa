const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// user CRUD

router.post("/register", async (req, res) => {
  try {
    const data = req.body;

    // Handle Anonymous Users
    if (data.isAnonymous) {
      const anonymousUser = new User({
        isAnonymous: true
      });

      await anonymousUser.save();
      return res.status(201).send(anonymousUser);
    }

    // Required fields for non-anonymous users
    const requiredFields = ["fullname", "email", "password", "phone", "address"];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    // Create registered user
    const newUser = new User({
      isAnonymous: false,
      fullname: data.fullname,
      email: data.email,
      password: data.password, // Will be hashed automatically in the schema
      phone: data.phone,
      address: data.address,
      upgradeStatus: data.upgradeStatus || false,
      isVolunteer: data.isVolunteer || false,
      badge: data.badge,
      associationId: data.upgradeStatus ? data.associationId : undefined
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);

  } catch (error) {
    console.error("Registration Error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${duplicateField} already exists`
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }

    // Generic error handler
    return res.status(500).json({ message: "Server error during registration" });
  }
});







router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    } 

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Compare passwords
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const payload = {
      _id: user._id,
      email: user.email,
      fullname: user.name
    };

    const token = jwt.sign(payload, "1234567", { expiresIn: "1h" });

    res.status(200).send({ token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ message: "Server error during login" });
  }
});


/* 

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
*/


router.put("/UpdateUser/:id", async (req, res) => {
  try {
    myid = req.params.id;
    data = req.body;
    update = await User.findByIdAndUpdate({ _id: myid }, data); 
    res.send(update);
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
    users = await User.find({ age: 21, fullname: "ela" });
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



module.exports = router;
