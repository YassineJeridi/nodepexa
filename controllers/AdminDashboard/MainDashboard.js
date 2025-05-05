const User = require("../../models/User");
const DonationBox = require("../../models/DonationBox");

// Helper: Get start of today
const getTodayDate = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// Helper: Get date N days ago
const getNDaysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(0, 0, 0, 0);
  return date;
};

// ✅ Unified Donation Chart Controller
exports.DonationChart = async (req, res) => {
  try {
    const tenDaysAgo = getNDaysAgo(10);
    const dailyDonations = await DonationBox.aggregate([
      {
        $match: {
          boxStatus: { $in: ["Checkout", "Picked", "Distributed"] },
          $or: [
            { "timeTrack.Checkout": { $exists: true, $gte: tenDaysAgo } },
            { "timeTrack.Picked": { $exists: true, $gte: tenDaysAgo } },
            { "timeTrack.Distributed": { $exists: true, $gte: tenDaysAgo } },
          ],
        },
      },
      {
        $project: {
          donationDate: {
            $cond: [
              { $ne: ["$timeTrack.Checkout", null] },
              "$timeTrack.Checkout",
              {
                $cond: [
                  { $ne: ["$timeTrack.Picked", null] },
                  "$timeTrack.Picked",
                  "$timeTrack.Distributed",
                ],
              },
            ],
          },
          price: 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$donationDate",
              timezone: "+00:00",
            },
          },
          total: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      dailyDonations.map((item) => ({
        date: item._id,
        donations: item.total,
      }))
    );
  } catch (error) {
    console.error("Chart data fetch error:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};

// ✅ Recent Donations (finalized only)
exports.RecentDonations = async (req, res) => {
  try {
    const recent = await DonationBox.find({
      boxStatus: { $in: ["Checkout", "Picked", "Distributed"] },
      $or: [
        { "timeTrack.Checkout": { $exists: true, $ne: null } },
        { "timeTrack.Picked": { $exists: true, $ne: null } },
        { "timeTrack.Distributed": { $exists: true, $ne: null } },
      ],
    })
      .sort({ "timeTrack.creation": -1 })
      .limit(20)
      .populate("donor", "fullName")
      .populate("items.product", "name");

    res.json(
      recent.map((box) => {
        const statusDate = ["Checkout", "Picked", "Distributed"].find(
          (status) => box.timeTrack?.[status] instanceof Date
        );

        return {
          _id: box._id,
          boxStatus: box.boxStatus,
          date: statusDate
            ? box.timeTrack?.[statusDate]?.toISOString()
            : box.timeTrack?.creation?.toISOString() ||
              new Date().toISOString(),
          userId: box.donor?.fullName || "Anonymous",
          region: box.region || "N/A",
          price: box.price || 0,
          items: box.items.map((item) => ({
            name: item.product?.name || "Unknown",
            quantity: item.quantity || 0,
          })),
          status: box.boxStatus,
        };
      })
    );
  } catch (error) {
    console.error("Recent donations fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch recent donations" });
  }
};

// ✅ Recent Users (last 5)
exports.RecentUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["Donor", "Volunteer"] },
    })
      .sort({ joinDate: -1 })
      .limit(20)
      .select("fullName email role phone joinDate");

    res.json(
      users.map((user) => ({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        date: user.joinDate.toISOString(),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent users" });
  }
};

// ✅ Today's Distributed Boxes
exports.DistributedBoxes = async (req, res) => {
  try {
    const result = await DonationBox.aggregate([
      {
        $match: {
          boxStatus: "Distributed", // ✅ Only "Distributed" status
          "timeTrack.Distributed": {
            $exists: true, // ✅ Ensure timestamp is set
            $gte: getTodayDate(), // ✅ Today's distribution
          },
        },
      },
      {
        $group: {
          _id: null,
          todayBoxes: { $sum: 1 },
          todayValue: { $sum: "$price" },
        },
      },
    ]);

    res.json(result[0] || { todayBoxes: 0, todayValue: 0 });
  } catch (error) {
    console.error("Distributed boxes error:", error);
    res.status(500).json({ error: "Failed to fetch distributed boxes" });
  }
};
// ✅ Today's Total Donations
exports.TodayDonations = async (req, res) => {
  try {
    const result = await DonationBox.aggregate([
      {
        $match: {
          boxStatus: { $in: ["Checkout", "Distributed"] },
          "timeTrack.Checkout": { $exists: true, $gte: getTodayDate() },
        },
      },
      { $group: { _id: null, totalValue: { $sum: "$price" } } },
    ]);
    res.json({ totalValue: result[0]?.totalValue || 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch total donations" });
  }
};

// ✅ Today's New Users
exports.NewUsers = async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: { $in: ["Donor", "Volunteer"] },
      joinDate: { $gte: getTodayDate()},
    });
    res.json({ totalUsers: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch new users" });
  }
};
