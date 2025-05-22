// controllers/associationDashboard/Volunteer.js
const User = require("../../models/User");
const DonationBox = require("../../models/DonationBox");
const jwt = require("jsonwebtoken");

exports.getVolunteersByAssociation = async (req, res) => {
  try {
    // 1. Authenticate and authorize association
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (
        decoded.role !== "Association" ||
        decoded.userId !== req.params.associationId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2. Fetch volunteers linked to this association and approved, and populate association name
    const volunteers = await User.find({
      associatedAssociation: req.params.associationId,
      role: "Volunteer",
      "approvals.association": true,
      "approvals.admin": true,
    })
      .select(
        "fullName phone email userStatus joinDate address associatedAssociation rewardPoints badge"
      )
      .populate({
        path: "associatedAssociation",
        select: "name",
      });

    // 3. For each volunteer, fetch metrics and attach association name
    const volunteersWithMetrics = await Promise.all(
      volunteers.map(async (volunteer) => {
        // Number of distributed boxes
        const distributedBoxes = await DonationBox.countDocuments({
          volunteer: volunteer._id,
          boxStatus: "Distributed",
        });

        // Average distribution time (in hours)
        const times = await DonationBox.aggregate([
          {
            $match: {
              volunteer: volunteer._id,
              boxStatus: "Distributed",
              "timeTrack.Picked": { $exists: true, $ne: null },
              "timeTrack.Distributed": { $exists: true, $ne: null },
            },
          },
          {
            $project: {
              diff: {
                $subtract: ["$timeTrack.Distributed", "$timeTrack.Picked"],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: "$diff" },
            },
          },
        ]);
        const avgDistributionTimeHours = times[0]
          ? Math.round((times[0].avgTime / 3600000) * 100) / 100
          : 0;

        return {
          ...volunteer.toObject(),
          associationName: volunteer.associatedAssociation?.name || "—",
          metrics: {
            numberOfDistributedBoxes: distributedBoxes,
            averageDistributionTimeHours: avgDistributionTimeHours,
          },
        };
      })
    );

    res.json(volunteersWithMetrics);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.removeVolunteer = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (
        decoded.role !== "Association" ||
        decoded.userId !== req.params.associationId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = "Donor";
    user.approvals = undefined;
    user.associatedAssociation = undefined;
    await user.save();

    res.json({ message: "Volunteer removed", user });
  } catch (error) {
    console.error("Remove volunteer error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPendingVolunteerApplications = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (
        decoded.role !== "Association" ||
        decoded.userId !== req.params.associationId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Only donors who applied and are pending approval
    const pending = await User.find({
      role: "Donor",
      associatedAssociation: req.params.associationId,
      $or: [
        { "approvals.association": { $exists: false } },
        { "approvals.association": null },
      ],
    }).select("fullName phone email joinDate address associatedAssociation");

    res.json(pending);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/association/:associationId/volunteers/:userId/approve
exports.setVolunteerApproval = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (
        decoded.role !== "Association" ||
        decoded.userId !== req.params.associationId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { approve } = req.body; // true or false
    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { "approvals.association": approve } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Approval updated", user: updated });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getVolunteerEvolution = async (req, res) => {
  try {
    // Authentication & Authorization
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (
        decoded.role !== "Association" ||
        decoded.userId !== req.params.associationId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Fetch all approved volunteers for this association
    const volunteers = await User.find({
      associatedAssociation: req.params.associationId,
      role: "Volunteer",
      "approvals.association": true,
      "approvals.admin": true,
    }).select("joinDate");

    // Count volunteers per day
    const dateCounts = {};
    volunteers.forEach((v) => {
      const day = v.joinDate.toISOString().slice(0, 10); // YYYY-MM-DD
      dateCounts[day] = (dateCounts[day] || 0) + 1;
    });

    // Build a sorted array of {date, count} with cumulative sum
    const sortedDates = Object.keys(dateCounts).sort();
    let cumulative = 0;
    const evolution = sortedDates.map((date) => {
      cumulative += dateCounts[date];
      return { date, count: cumulative };
    });

    res.json(evolution);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getVolunteerStats = async (req, res) => {
  try {
    // 1. Authenticate and authorize association
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (
        decoded.role !== "Association" ||
        decoded.userId !== req.params.associationId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const associationId = req.params.associationId;

    // Total Volunteers (fully approved)
    const totalVolunteers = await User.countDocuments({
      associatedAssociation: associationId,
      role: "Volunteer",
      "approvals.association": true,
      "approvals.admin": true,
    });

    // Total Applications (pending association approval)
    const totalApplications = await User.countDocuments({
      associatedAssociation: associationId,
      role: "Donor",
      $or: [
        { "approvals.association": { $exists: false } },
        { "approvals.association": null },
      ],
    });

    // Waiting Admin Approval (association-approved, admin not set)
    const waitingAdminApproval = await User.countDocuments({
      associatedAssociation: associationId,
      role: "Donor",
      "approvals.association": true,
      $or: [
        { "approvals.admin": { $exists: false } },
        { "approvals.admin": null },
      ],
    });

    res.json({
      totalVolunteers,
      totalApplications,
      waitingAdminApproval,
    });
  } catch (error) {
    console.error("Volunteer stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
