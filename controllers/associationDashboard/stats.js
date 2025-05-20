const mongoose = require("mongoose");
const DonationBox = require("../../models/DonationBox");
const Association = require("../../models/Association");
const User = require("../../models/User");
require("../../models/Region"); // Ensure Region model is registered

exports.getAssociationOverviewStats = async (req, res) => {
  try {
    // Validate association ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid association ID" });
    }
    const associationId = new mongoose.Types.ObjectId(req.params.id);

    // Get association with its region reference
    const association = await Association.findById(associationId)
      .select("region")
      .lean();

    if (!association || !association.region) {
      return res.status(404).json({ error: "Association or region not found" });
    }
    const regionId = association.region;

    // Card 1: Available (Checkout) boxes in association's region
    const available = await DonationBox.countDocuments({
      boxStatus: "Checkout",
      region: regionId, // Now querying by ObjectId
    });

    // Find approved volunteers for this association
    const volunteerIds = await User.find({
      role: "Volunteer",
      associatedAssociation: associationId,
      "approvals.association": true,
      "approvals.admin": true,
    }).distinct("_id");

    // Card 2: Distributed boxes by approved volunteers
    const distributed = await DonationBox.countDocuments({
      boxStatus: "Distributed",
      volunteer: { $in: volunteerIds },
    });

    // Card 3: Picked boxes by approved volunteers
    const picking = await DonationBox.countDocuments({
      boxStatus: "Picked",
      volunteer: { $in: volunteerIds },
    });

    res.json({ available, distributed, picking });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getDistributedPerDay = async (req, res) => {
  try {
    const associationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(associationId)) {
      return res.status(400).json({ error: "Invalid association ID" });
    }

    // Get all approved volunteers for this association
    const volunteerIds = await User.find({
      role: "Volunteer",
      associatedAssociation: associationId,
      "approvals.association": true,
      "approvals.admin": true,
    }).distinct("_id");

    // Aggregate distributed boxes per day for these volunteers
    const result = await DonationBox.aggregate([
      {
        $match: {
          boxStatus: "Distributed",
          volunteer: { $in: volunteerIds },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timeTrack.Distributed",
            },
          },
          distributed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for frontend
    const data = result.map((d) => ({
      day: d._id,
      distributed: d.distributed,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching distributed per day:", err);
    res.status(500).json({ error: "Server error" });
  }
};
