const DonationBox = require("../models/DonationBox");
const User = require("../models/User");
const Association = require("../models/Association");

exports.getCheckoutBoxesForVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.user.id)
      .select("association")
      .populate({
        path: "association",
        select: "region",
        populate: {
          path: "region",
          model: "Region",
          select: "_id",
        },
      });

    if (!volunteer?.association?.region) {
      return res.status(400).json({
        error: "Volunteer is not linked to an association with a region",
      });
    } // ← Closing brace added

    const regionId = volunteer.association.region._id;

    const boxes = await DonationBox.find({
      boxStatus: "Checkout",
      region: regionId,
    })
      .populate("items.product")
      .populate("donor")
      .populate("region");

    res.json(boxes);
  } catch (error) {
    console.error("Volunteer box fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
