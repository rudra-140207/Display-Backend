const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  sender: {
    type: String,
  },
  receiver: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  videoTitle: {
    type: String,
    default: null,
  },
  videoUrl: {
    type: String,
    default: null,
  },
  hasVideo: {
    type: Boolean,
    default: false,
  },
  imageTitle: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  hasImage: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

module.exports = {
  Notification: mongoose.model("Notification", NotificationSchema),
};
