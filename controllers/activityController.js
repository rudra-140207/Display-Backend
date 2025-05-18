const Activity = require("../models/Activity");

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({});
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createActivity = async (req, res) => {
  const { name, startDate, endDate, description, year } = req.body;
  try {
    const activity = new Activity({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      year,
    });
    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Failed to save activity" });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete activity" });
  }
};
