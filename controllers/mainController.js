//controllers/mainController.js

const DonationBox = require("../models/DonationBox");
const User = require("../models/User");
const Association = require("../models/Association");

// 1. Get total donations count
exports.getDonationsCount = async (req, res) => {
  try {
    const count = await DonationBox.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error in getDonationsCount:", err);
    res.status(500).json({ error: "Failed to fetch donations count" });
  }
};

// 2. Get user counts by role (Donor/Volunteer)
exports.getUserRoleCounts = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: { $in: ["Donor", "Volunteer"] } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const counts = { Donor: 0, Volunteer: 0 };
    result.forEach((r) => (counts[r._id] = r.count));
    res.json(counts);
  } catch (err) {
    console.error("Error in getUserRoleCounts:", err);
    res.status(500).json({ error: "Failed to count users by role" });
  }
};

// 3. Get partners count
exports.getPartnersCount = async (req, res) => {
  try {
    const count = await Association.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error in getPartnersCount:", err);
    res.status(500).json({ error: "Failed to count partners" });
  }
};
