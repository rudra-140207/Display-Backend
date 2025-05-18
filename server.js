const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const uploadRoutes = require("./routes/uploadRoutes");
const imageRoutes = require("./routes/imageRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://kiet-display.onrender.com",
    "https://kiet-display-admin.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "DELETE"],
}));

app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));


app.use("/api/activities", activityRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/notification", notificationRoutes); 
app.use("/api", uploadRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
