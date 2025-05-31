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

// Get all boxes for a user, with special filtering for "Distributed" status
exports.getUserBoxesWithStatusFilter = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Calculate 2 days ago
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Build the query for status "Checkout" or "Picked"
    const statusQuery = {
      $or: [{ boxStatus: "Checkout" }, { boxStatus: "Picked" }],
    };

    // Build the query for status "Distributed" and timeTrack.Distributed >= twoDaysAgo
    const distributedQuery = {
      boxStatus: "Distributed",
      "timeTrack.Distributed": { $gte: twoDaysAgo },
    };

    // Combine both queries
    const query = {
      donor: userId,
      $or: [statusQuery, distributedQuery],
    };

    const boxes = await DonationBox.find(query)
      .populate("items.product")
      .populate("region");

    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
