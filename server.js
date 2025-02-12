const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://kiet-display.onrender.com",
    "https://kiet-display-admin.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "DELETE"]
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));


const activitySchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  description: String,
  year: Number
});

const imageSchema = new mongoose.Schema({
  name : String,
  imageUrl: String
});

const imageArraySchema = new mongoose.Schema({
  imageArray : [{
    type : String
  }]
});

const Activity = mongoose.model("Activity", activitySchema);
const Image = mongoose.model("Image", imageSchema);
const ImageArray = mongoose.model("ImageArray", imageArraySchema);

app.get("/api/activities", async (req, res) => {
  try {
    const activities = await Activity.find({});
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/activities", async (req, res) => {
  const { name, startDate, endDate, description, year } = req.body;
  const activity = new Activity({
    name,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    description,
    year
  });
  await activity.save();
  res.json(activity);
});

app.delete("/api/activities/:id", async (req, res) => {
  const { id } = req.params;
  await Activity.findByIdAndDelete(id);
  res.json({ message: "Activity deleted" });
});

app.delete("/api/images/:id", async (req, res) => {
  const { id } = req.params;
  await Image.findByIdAndDelete(id);
  res.json({ message: "Image deleted" });
});

app.post("/api/images", async (req, res) => {
  const { name, imageUrl } = req.body;
  
  if (!name || !imageUrl) {
    return res.status(400).json({ message: "Name and Image URL are required" });
  }

  try {
    const image = new Image({ name, imageUrl });
    await image.save();
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: "Error saving image" });
  }
});



app.get("/api/images", async (req, res) => {
  try {
    const images = await Image.find({}, "name imageUrl"); // Only fetch name & imageUrl
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



app.post("/api/imageDrawer", async (req, res) => {
  try {
    const { imageArray } = req.body; // Extract the array correctly

    if (!Array.isArray(imageArray)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array." });
    }

    if (imageArray.length > 10) {
      return res.status(400).json({ message: "Not more than 10 images can be selected" });
    }

    const newArray = await ImageArray.create({ imageArray });

    return res.status(200).json({ message: "Array saved in DB", data: newArray });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
