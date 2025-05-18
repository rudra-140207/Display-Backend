const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  description: String,
  year: Number,
});

module.exports = mongoose.model("Activity", activitySchema);
