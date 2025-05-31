// Get available boxes for volunteer's region
exports.getAvailableBoxesByRegion = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get volunteer's region from associated association
    const volunteer = await User.findById(decoded.userId).populate(
      "associatedAssociation"
    );

    const boxes = await DonationBox.find({
      status: "Available",
      region: volunteer.associatedAssociation.region,
    }).populate("region donor");

    res.json(boxes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update box status
exports.updateBoxStatus = async (req, res) => {
  try {
    const box = await DonationBox.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    res.json(box);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add points to volunteer
exports.addVolunteerPoints = async (req, res) => {
  try {
    const volunteer = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { rewardPoints: 10 } },
      { new: true }
    );
    res.json(volunteer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Handle image upload
exports.uploadDistributionImage = async (req, res) => {
  try {
    const box = await DonationBox.findById(req.params.id);
    box.distributionProof = req.file.path; // Store image path
    await box.save();
    res.json(box);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
