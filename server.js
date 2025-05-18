const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { SerialPort } = require('serialport');
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


// const arduinoPort = new SerialPort({
//   path: 'COM5',
//   baudRate: 9600,
// });

// app.post('/send-to-arduino', (req, res) => {
//   const { state } = req.body;
//   if (!state) {
//     return res.status(400).send('Missing room or state');
//   }

//   const command = `${state}\n`;
//   arduinoPort.write(command, (err) => {
//     if (err) {
//       console.error('Error writing to Arduino:', err);
//       return res.status(500).send('Failed to write to Arduino');
//     }
//     console.log('Command sent:', command.trim());
//     res.send('Command sent');
//   });
// });

app.listen(5000, () => console.log("Server running on port 5000"));
