const User = require("../../models/User");
const DonationBox = require("../../models/DonationBox");

// Helper: Get today's date with time reset
const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper: Get start of week (Sunday)
const getWeekDate = () => {
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
  firstDay.setHours(0, 0, 0, 0);
  return firstDay;
};

exports.getDashboardSummary = async (req, res) => {
  try {
    // Batched database queries
    const [donorStats, volunteerStats, boxStats] = await Promise.all([
      // Donor stats
      User.aggregate([
        { $match: { role: "Donor" } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            newThisWeek: {
              $sum: {
                $cond: [
                  // Start $cond array
                  { $gte: ["$joinDate", getWeekDate()] }, // Condition
                  1, // Then
                  0, // Else
                ], // ✅ Close $cond array [[1]]
              },
            },
          },
        },
      ]).then((result) => result[0] || { total: 0, newThisWeek: 0 }),

      // Volunteer stats
      User.aggregate([
        { $match: { role: "Volunteer", volunteerStatus: "enabled" } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
      ]).then((result) => result[0] || { total: 0, avgRating: 0 }),

      // Donation box stats
      DonationBox.aggregate([
        { $match: { "timeTrack.creation": { $gte: getTodayDate() } } },
        {
          $group: {
            _id: null,
            todayBoxes: { $sum: 1 },
            todayValue: { $sum: "$price" },
          },
        },
      ]).then((result) => result[0] || { todayBoxes: 0, todayValue: 0 }),
    ]); // ✅ Close Promise.all array [[2]]

    // Weekly donation total
    const weeklyDonations = await DonationBox.aggregate([
      {
        $match: {
          "timeTrack.creation": {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }, // ✅ Close $match
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      }, // ✅ Close $group
    ]).then((result) => result[0] || { total: 0 });

    // Recent donations (last 5 boxes)
    const recentDonations = await DonationBox.find()
      .sort({ "timeTrack.creation": -1 })
      .limit(5)
      .select("timeTrack.creation donor volunteer boxStatus")
      .populate("donor", "fullName")
      .populate("volunteer", "fullName");

    // Daily donation history (last 7 days)
    const donationHistory = await DonationBox.aggregate([
      {
        $match: {
          "timeTrack.creation": {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }, // ✅ Close $match
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timeTrack.creation" },
          },
          total: { $sum: "$price" },
        },
      }, // ✅ Close $group
      { $sort: { _id: 1 } },
    ]); // ✅ Close aggregation array

    // Build response
    res.json({
      stats: {
        users: {
          totalDonors: donorStats.total,
          newThisWeek: donorStats.newThisWeek,
        },
        donations: {
          todayBoxes: boxStats.todayBoxes,
          todayValue: boxStats.todayValue,
          weeklyTotal: weeklyDonations.total,
        },
        volunteers: {
          active: volunteerStats.total,
          averageRating: volunteerStats.avgRating?.toFixed(1) || 0,
        },
      },
      donationsData: donationHistory.map((item) => ({
        date: item._id,
        donations: item.total,
      })),
      briefDonations: recentDonations.map((box) => ({
        date: box.timeTrack.creation.toISOString().split("T")[0],
        userId: box.donor?.fullName || "Anonymous",
        boxes: box._id,
        status: box.boxStatus,
      })),
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};
