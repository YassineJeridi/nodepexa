const User = require("../../models/User");
const DonationBox = require("../../models/DonationBox");

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all donations for a user
exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const donations = await DonationBox.find({ donor: userId })
      .populate("items.product")
      .populate("region");
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

