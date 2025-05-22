const DonationBox = require("../../models/DonationBox");
const User = require("../../models/User");
const Association = require("../../models/Association");

// GET /api/associationDashboard/:associationId/boxes
exports.getDonationBoxesForAssociation = async (req, res) => {
  try {
    const { associationId } = req.params;

    // 1. Get the association and its region
    const association = await Association.findById(associationId).populate(
      "region"
    );
    if (!association) {
      return res.status(404).json({ error: "Association not found" });
    }

    // 2. Get all volunteers for this association
    const volunteers = await User.find({
      associatedAssociation: associationId,
      role: "Volunteer",
      "approvals.association": true,
      "approvals.admin": true,
    }).select("_id fullName email phone badge joinDate address rewardPoints");

    const volunteerIds = volunteers.map((v) => v._id);

    // 3. Get boxes
    const checkoutBoxes = await DonationBox.find({
      boxStatus: "Checkout",
      region: association.region?._id,
    })
      .populate(
        "volunteer",
        "fullName email phone badge joinDate address rewardPoints associatedAssociation"
      )
      .populate("items.product", "name")
      .populate("region", "name");

    const pickedOrDistributedBoxes = await DonationBox.find({
      boxStatus: { $in: ["Picked", "Distributed"] },
      volunteer: { $in: volunteerIds },
    })
      .populate(
        "volunteer",
        "fullName email phone badge joinDate address rewardPoints associatedAssociation"
      )
      .populate("items.product", "name")
      .populate("region", "name");

    const allBoxes = [...checkoutBoxes, ...pickedOrDistributedBoxes];

    const formattedBoxes = allBoxes.map((box) => ({
      _id: box._id,
      boxStatus: box.boxStatus,
      region: box.region?._id,
      regionName: box.region?.name || "",
      volunteer: box.volunteer
        ? {
            _id: box.volunteer._id,
            fullName: box.volunteer.fullName,
            email: box.volunteer.email,
            phone: box.volunteer.phone,
            badge: box.volunteer.badge,
            joinDate: box.volunteer.joinDate,
            address: box.volunteer.address,
            rewardPoints: box.volunteer.rewardPoints,
            associationName: association.name,
          }
        : null,
      items: box.items.map((item) => ({
        product: item.product?._id || item.product,
        productName: item.product?.name || "",
        quantity: item.quantity,
      })),
    }));

    res.json({ boxes: formattedBoxes });
  } catch (error) {
    console.error("Error in getDonationBoxesForAssociation:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/associationDashboard/:associationId/available-volunteers
exports.getAvailableVolunteers = async (req, res) => {
  try {
    const { associationId } = req.params;

    // 1. Get the association (to verify it exists)
    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(404).json({ error: "Association not found" });
    }

    // 2. Get all volunteers for this association
    const volunteers = await User.find({
      associatedAssociation: associationId,
      role: "Volunteer",
      "approvals.association": true,
      "approvals.admin": true,
    }).select("_id fullName email phone badge joinDate address rewardPoints");

    const volunteerIds = volunteers.map((v) => v._id);

    // 3. Find all volunteers who are currently assigned to a "Picked" box
    const pickedBoxes = await DonationBox.find({
      boxStatus: "Picked",
      volunteer: { $in: volunteerIds },
    }).select("volunteer");

    const pickedVolunteerIds = pickedBoxes
      .map((b) => b.volunteer?.toString())
      .filter(Boolean);

    // 4. Available volunteers: those NOT in pickedVolunteerIds
    const availableVolunteers = volunteers
      .filter((v) => !pickedVolunteerIds.includes(v._id.toString()))
      .map((v) => ({
        _id: v._id,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        badge: v.badge,
        joinDate: v.joinDate,
        address: v.address,
        rewardPoints: v.rewardPoints,
        associationName: association.name,
      }));

    res.json({ availableVolunteers });
  } catch (error) {
    console.error("Error in getAvailableVolunteers:", error);
    res.status(500).json({ error: "Server error" });
  }
};
