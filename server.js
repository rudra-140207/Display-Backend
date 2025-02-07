const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://kiet-display.onrender.com",
      "https://kiet-display-admin.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// const formatDate = (date) => {
//   const d = new Date(date);
//   return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
// };

const activitySchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  description: String,
});

const Activity = mongoose.model("Activity", activitySchema);

app.get("/api/activities", async (req, res) => {
  try {
    const activities = await Activity.find({});
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/activities", async (req, res) => {
  const { name, startDate, endDate, description } = req.body;

  const activity = new Activity({
    name,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    description,
  });

  await activity.save();
  res.json(activity);
});

app.delete("/api/activities/:id", async (req, res) => {
  const { id } = req.params;
  await Activity.findByIdAndDelete(id);
  res.json({ message: "Activity deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
