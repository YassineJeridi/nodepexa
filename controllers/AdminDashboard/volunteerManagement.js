const DonationBox = require("../../models/DonationBox");
const Association = require("../../models/Association");
const User = require("../../models/User");

// Get top volunteer this week
exports.getTopVolunteer = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const topVolunteer = await User.aggregate([
      {
        $match: {
          role: "Volunteer",
          "timeTrack.Distributed": { $gte: startOfWeek },
        },
      },
      {
        $lookup: {
          from: "donationboxes",
          localField: "_id",
          foreignField: "volunteer",
          as: "distributedBoxes",
        },
      },
      {
        $project: {
          fullName: 1,
          distributedCount: { $size: "$distributedBoxes" },
        },
      },
      { $sort: { distributedCount: -1 } },
      { $limit: 1 },
    ]);

    res.json(topVolunteer[0] || { fullName: "N/A", distributedCount: 0 });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all available boxes (status = Checkout)
exports.getAvailableBoxes = async (req, res) => {
  try {
    const boxes = await DonationBox.find({ boxStatus: "Checkout" });
    res.json({ count: boxes.length });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get today's distributed boxes
exports.getTodaysDistributed = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const boxes = await DonationBox.find({
      "timeTrack.Distributed": { $gte: today },
    });

    res.json({ count: boxes.length });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get total number of volunteers
exports.getTotalVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: "Volunteer" });
    res.json({ count: volunteers.length });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Approve volunteer
exports.approveVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = "Volunteer";
    user.approvals = {
      ...user.approvals,
      admin: true,
    };
    user.badge = "Iron";
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Failed to approve volunteer:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Reject volunteer request
exports.rejectVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Use $unset to remove association-related fields
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          role: "Donor",
          associatedAssociation: undefined,
          badge: undefined,
        },
        $unset: {
          associatedAssociation: "",
          badge: "",
          "approvals.association": "",
          "approvals.admin": "",
        },
      },
      { new: true }
    );

    res.json({ message: "Request rejected. Fields removed." });
  } catch (error) {
    console.error("Failed to reject volunteer:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get approval requests
exports.getApprovalRequests = async (req, res) => {
  try {
    const requests = await User.find({
      role: "Donor",
      "approvals.association": true,
    }).populate("associatedAssociation");

    if (!requests || requests.length === 0) {
      return res.status(404).json({ error: "No approval requests" });
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllAssociations = async (req, res) => {
  try {
    const associations = await Association.find({}, "_id name");
    return res.status(200).json(associations);
  } catch (error) {
    console.error("Failed to fetch associations:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
