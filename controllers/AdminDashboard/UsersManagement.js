const User = require("../../models/User");
const DonationBox = require("../../models/DonationBox");
const mongoose = require("mongoose");

// ✅ Get Top 3 Donors
exports.getTopDonors = async (req, res) => {
  try {
    const topDonors = await DonationBox.aggregate([
      {
        $match: {
          boxStatus: { $in: ["Checkout", "Picked", "Distributed"] },
          donor: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$donor",
          totalDonations: { $sum: "$price" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ["$user.fullName", 0] },
          amount: "$totalDonations",
        },
      },
      {
        $sort: { amount: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    res.json(
      topDonors.map((donor, i) => ({
        name: donor.name || "Anonymous",
        amount: donor.amount,
        rank: i + 1,
      }))
    );
  } catch (error) {
    console.error("Top donors fetch error:", error);
    res.status(500).json({ error: "Failed to fetch top donors" });
  }
};

// ✅ Get Latest 30 Users
exports.getLatestUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["Donor", "Volunteer"] },
    })
      .sort({ joinDate: -1 })
      .limit(30)
      .select(
        "fullName email role phone address userStatus badge associatedAssociation joinDate rewardPoints"
      )
      .populate("associatedAssociation", "name");

    // ✅ Log users to verify data
    console.log(
      "Fetched Users:",
      users.map((u) => u.toObject())
    );

    const donations = await DonationBox.find({
      boxStatus: { $in: ["Checkout", "Picked", "Distributed"] },
      donor: { $exists: true },
    }).select("donor price");

    // ✅ Log donations to verify mapping
    console.log(
      "Donations:",
      donations.map((d) => d.toObject())
    );

    const donationsByUser = donations.reduce((acc, d) => {
      acc[d.donor.toString()] = (acc[d.donor.toString()] || 0) + d.price;
      return acc;
    }, {});

    const userData = users.map((user) => ({
      id: user._id,
      name: user.fullName || "Anonymous",
      role: user.role,
      phone: user.phone || "N/A",
      date: user.joinDate?.toISOString().split("T")[0] || "N/A",
      status: user.userStatus || "N/A",
      email: user.email || "N/A",
      Points: user.rewardPoints || 0,
      address: user.address || "N/A",
      totalDonation: donationsByUser[user._id.toString()] || 0,
      badge: user.badge || "N/A",
      associatedAssociation: user.associatedAssociation?.name || "N/A",
    }));

    res.json(userData);
  } catch (error) {
    console.error("User list fetch error:", error);
    res.status(500).json([]); // ✅ Return empty array on error
  }
};

// ✅ Add New User

exports.addNewUser = async (req, res) => {
  try {
    const userData = req.body;

    // ✅ Validate volunteer fields if role is Volunteer
    if (userData.role === "Volunteer") {
      if (!["enabled", "disabled"].includes(userData.volunteerStatus)) {
        return res.status(400).json({ error: "Invalid volunteer status" });
      }

      if (!["Iron", "Bronze", "Silver", "Gold"].includes(userData.badge)) {
        return res.status(400).json({ error: "Invalid badge level" });
      }

      if (!userData.associatedAssociation) {
        return res
          .status(400)
          .json({ error: "Association ID required for volunteers" });
      }
    }

    const newUser = await User.create(userData);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ error: `${duplicateField} already exists` });
    }
    res.status(500).json({ error: "Server error" });
  }
};
