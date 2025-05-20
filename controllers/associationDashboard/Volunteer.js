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
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    // Validate token and association ownership (as before)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Optionally check association ownership here as well
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: { role: "Donor" },
        $unset: {
          badge: "",
          associatedAssociation: "",
          approvals: "",
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    res.json({
      message: "Volunteer successfully removed",
      user: {
        _id: updatedUser._id,
        role: updatedUser.role,
        fullName: updatedUser.fullName,
      },
    });
  } catch (error) {
    console.error("Error removing volunteer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
