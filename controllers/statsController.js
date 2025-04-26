const User = require("../models/User");
const DonationBox = require("../models/DonationBox");
const Association = require("../models/Association");

const getStats = async (req, res) => {
  try {
    // Count registered users (Donor or Volunteer)
    const registeredUsersCount = await User.countDocuments({
      role: { $in: ["Donor", "Volunteer"] },
    });

    // Count donors only
    const donorCount = await User.countDocuments({ role: "Donor" });

    // Count donation boxes (Actions)
    const donationBoxCount = await DonationBox.countDocuments();

    // Count associations
    const associationCount = await Association.countDocuments();

    res.status(200).json({
      associations: associationCount,
      donateurs: donorCount,
      casatiens: registeredUsersCount,
      actions: donationBoxCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

module.exports = { getStats };
