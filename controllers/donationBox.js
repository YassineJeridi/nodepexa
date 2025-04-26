const DonationBox = require("../models/DonationBox");
const User = require("../models/User");
const Product = require("../models/Product");

exports.createDonationBox = async (req, res) => {
  try {
    const { items, donor } = req.body;

    // Validate donor
    if (!donor) return res.status(400).json({ error: "Donor is required" });
    const user = await User.findById(donor);
    if (!user) return res.status(404).json({ error: "Donor not found" });

    // Check for existing "Collecting" box
    const existingBox = await DonationBox.findOne({
      donor,
      boxStatus: "Collecting",
    });
    if (existingBox) {
      return res.status(400).json({
        error: "You already have a donation box in 'Collecting' status",
      });
    }

    // Validate products & calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({ error: `Product not found: ${item.product}` });
      }

      const quantity = item.quantity || 1;
      totalPrice += product.price * quantity;
    }

    // Create box
    const donationBox = await DonationBox.create({
      items,
      price: totalPrice,
      donor,
      boxStatus: "Collecting",
      timeTrack: { creation: new Date() },
    });

    res.status(201).json(donationBox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addRegion = async (req, res) => {
  try {
    const { region } = req.body;
    const updatedBox = await DonationBox.findByIdAndUpdate(
      req.params.id,
      { region },
      { new: true }
    );
    res.json(updatedBox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, volunteer } = req.body;
    const validStatuses = [
      "Collecting",
      "Completed",
      "Cancelled",
      "Picked",
      "Distributed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const donationBox = await DonationBox.findById(req.params.id);
    if (!donationBox) {
      return res.status(404).json({ error: "Donation box not found" });
    }

    // Check for region before setting status to Completed
    if (status === "Completed" && !donationBox.region) {
      return res.status(400).json({
        error: "Region must be selected before marking as Completed",
      });
    }

    // Check for volunteer when setting status to Picked
    if (status === "Picked") {
      if (!volunteer) {
        return res.status(400).json({ error: "Volunteer is required" });
      }

      const user = await User.findById(volunteer);
      if (!user || user.role !== "Volunteer") {
        return res
          .status(400)
          .json({ error: "Volunteer not found or invalid role" });
      }

      // Assign volunteer to the box
      donationBox.volunteer = volunteer;
    }

    // Update status and time tracking
    donationBox.boxStatus = status;
    donationBox.timeTrack[status.toLowerCase()] = Date.now();

    await donationBox.save();
    res.json(donationBox);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // Validate product
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(400).json({ error: "Product not found" });
    }

    const box = await DonationBox.findById(req.params.id);
    if (!box) return res.status(404).json({ error: "Donation box not found" });

    // Check if item already exists
    const existingItem = box.items.find(
      (item) => item.product.toString() === product
    );
    if (existingItem) {
      return res.status(400).json({ error: "Item already exists in the box" });
    }

    const productPrice = productExists.price * quantity;
    box.items.push({ product, quantity });
    box.price += productPrice;

    await box.save();
    res.json(box);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const box = await DonationBox.findById(req.params.id);
    if (!box) return res.status(404).json({ error: "Donation box not found" });

    console.log("productId from req.body:", productId);
    console.log(
      "Items in box:",
      box.items.map((item) => item.product.toString())
    );

    const itemToRemove = box.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!itemToRemove) {
      return res.status(404).json({ error: "Item not found in box" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    const itemPrice = product.price * itemToRemove.quantity;
    box.price -= itemPrice;

    box.items = box.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await box.save();
    res.json({ message: "Item removed successfully", box });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const box = await DonationBox.findById(req.params.id).populate(
      "items.product"
    );
    if (!box) return res.status(404).json({ error: "Donation box not found" });

    const item = box.items.find((i) => i.product._id.toString() === productId);
    if (!item) return res.status(404).json({ error: "Item not found in box" });

    const oldTotal = item.quantity * item.product.price;
    const newTotal = quantity * item.product.price;

    let newquantity = item.quantity + quantity;
    if (newquantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    item.quantity = newquantity;

    box.price = box.price - oldTotal + newTotal;

    await box.save();
    res.json(box);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonationBoxById = async (req, res) => {
  try {
    const box = await DonationBox.findById(req.params.id)
      .populate("donor")
      .populate("items.product");
    if (!box) return res.status(404).json({ error: "Donation box not found" });
    res.json(box);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDonationBoxes = async (req, res) => {
  try {
    const boxes = await DonationBox.find()
      .populate("donor")
      .populate("items.product");
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
