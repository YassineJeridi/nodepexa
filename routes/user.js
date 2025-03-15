const express = require("express");
const router = express.Router();
const User = require("../models/user");

// user CRUD
router.post("/add", (req, res) => {
  data = req.body;
  usr = new User(data);
  usr
    .save()
    .then((savedUser) => {
      res.status(200).send(savedUser);
    })
    .catch((err) => {
      res.status(400);
      send(err);
    });

  console.log("user added");
});

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
