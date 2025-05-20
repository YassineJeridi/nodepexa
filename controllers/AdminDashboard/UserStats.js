import User from "../../models/User.js";

export const getStats = async (req, res) => {
  try {
    // ✅ Total users (Donor/Volunteer)
    const registeredUsersCount = await User.countDocuments({
      role: { $in: ["Donor", "Volunteer"] },
    });

    // ✅ Total donors
    const donorCount = await User.countDocuments({ role: "Donor" });

    // ✅ Total volunteers
    const volunteerCount = await User.countDocuments({ role: "Volunteer" });

    // ✅ New users this month (use UTC to avoid timezone issues)
    const today = new Date();
    const startOfMonth = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), 1)
    );

    const newUsersThisMonth = await User.countDocuments({
      role: { $in: ["Donor", "Volunteer"] },
      joinDate: { $gte: startOfMonth }, // ✅ Use `joinDate` directly
    });

    // ✅ Return stats (remove growth rate)
    res.status(200).json({
      totalUsers: registeredUsersCount,
      newUsersThisMonth,
      totalDonors: donorCount,
      totalVolunteers: volunteerCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

export default { getStats };
