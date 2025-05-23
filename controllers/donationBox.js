const DonationBox = require("../models/DonationBox");
const User = require("../models/User");
const mongoose = require("mongoose");
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
    if (!region || region.trim() === "") {
      return res.status(400).json({ error: "Region cannot be empty" });
    }

    const updatedBox = await DonationBox.findByIdAndUpdate(
      req.params.id,
      { region },
      { new: true }
    );
    if (!updatedBox)
      return res.status(404).json({ error: "Donation box not found" });
    res.json(updatedBox);
  } catch (error) {
    console.error("Region update failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const box = await DonationBox.findById(req.params.id);
    if (!box) return res.status(404).json({ error: "Donation box not found" });

    // ✅ Validate volunteer ID
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ error: "Invalid volunteer ID" });
    }

    const testRole = await User.exists({ _id: volunteerId, role: "Volunteer" });
    if (!testRole)
      return res
        .status(400)
        .json({ error: "Selected user is not a volunteer" });

    // ✅ Assign volunteer

    box.volunteer = volunteerId;
    box.boxStatus = "Picked";
    box.timeTrack.Picked = Date.now();
    await box.save();
    res.json(box);
  } catch (error) {
    console.error("Failed to assign volunteer:", error.message);
    res.status(500).json({ error: "Server error" });
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

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    item.quantity = quantity;
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

// controllers/donationBox.js
exports.getAllDonationBoxes = async (req, res) => {
  try {
    const { volunteer } = req.query;
    const query = {};

    // ✅ Validate volunteer ID if present
    if (volunteer) {
      if (!mongoose.Types.ObjectId.isValid(volunteer)) {
        return res.status(400).json({ error: "Invalid volunteer ID" });
      }
      query.volunteer = volunteer;
    }

    const boxes = await DonationBox.find(query)
      .populate("donor")
      .populate("volunteer")
      .populate("items.product")
      .select("boxStatus price region volunteer donor items timeTrack");

    res.json(boxes);
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getDonationChartData = async (req, res) => {
  try {
    // ✅ Find boxes where "Checkout" status is set
    const boxes = await DonationBox.find({
      "timeTrack.Checkout": { $exists: true },
    }).select("price timeTrack.Checkout");

    // ✅ Group donations by date and sum price
    const grouped = boxes.reduce((acc, box) => {
      const date = new Date(box.timeTrack.Checkout).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + box.price;
      return acc;
    }, {});

    // ✅ Convert to chart-ready format
    const chartData = Object.entries(grouped).map(([date, donations]) => ({
      date,
      donations,
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeVolunteer = async (req, res) => {
  try {
    const box = await DonationBox.findById(req.params.id);
    if (!box) return res.status(404).json({ error: "Donation box not found" });

    // ✅ Clear volunteer and update status
    box.volunteer = null;
    box.boxStatus = "Checkout";

    await box.save();
    res.json(box); // ✅ Always return JSON
  } catch (error) {
    console.error("Failed to remove volunteer:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, volunteer } = req.body;
    const validStatuses = [
      "Collecting",
      "Checkout",
      "Picked",
      "Distributed",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const donationBox = await DonationBox.findById(req.params.id);
    if (!donationBox) {
      return res.status(404).json({ error: "Donation box not found" });
    }

    // ✅ Allow cancellation without volunteer/region checks
    if (status === "Cancelled") {
      donationBox.boxStatus = status;
      donationBox.timeTrack.Cancelled = new Date();
      await donationBox.save();
      return res.json(donationBox);
    }

    // ✅ Handle other status updates (Checkout, Picked, Distributed)
    switch (status) {
      case "Checkout":
        // ✅ Allow transition from Collecting to Checkout
        if (donationBox.boxStatus !== "Collecting") {
          return res.status(400).json({ error: "Invalid status transition" });
        }
        donationBox.boxStatus = status;
        donationBox.timeTrack.Checkout = new Date();
        break;

      case "Picked":
        // ✅ Require volunteer before picking
        donationBox.volunteer = volunteer;
        console.log(donationBox.volunteer.toHexString());

        if (!donationBox.volunteer) {
          return res
            .status(400)
            .json({ error: "Volunteer is required for Picked status" });
        }
        donationBox.boxStatus = status;
        donationBox.timeTrack.Picked = new Date();
        break;

      case "Distributed":
        // ✅ Require region before distribution
        if (!donationBox.region) {
          return res
            .status(400)
            .json({ error: "Region is required for Distribution" });
        }
        donationBox.boxStatus = status;
        donationBox.timeTrack.Distributed = new Date();
        break;

      default:
        return res.status(400).json({ error: "Status update not supported" });
    }

    await donationBox.save();
    res.json(donationBox);
  } catch (error) {
    console.error("Status update failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};



// GET /api/userdashboard/:userId/donations
exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    // Find all donation boxes where donor matches userId
    const donations = await DonationBox.find({ donor: userId })
      .populate("items.product")
      .populate("region");
    res.json(donations);
  } catch (error) {
    console.error("Error fetching user donations:", error);
    res.status(500).json({ error: "Server error" });
  }
};
