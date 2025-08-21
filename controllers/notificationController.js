const { Notification } = require("../models/notification");

const getTestNotification = async (req, res) => {
  const { receiver } = req.params;

  try {
    const latestNotification = await Notification.findOne({ receiver }).sort({
      createdAt: -1,
    }); // newest first

    if (!latestNotification) {
      return res.status(200).json({ message: "No notifications found." });
    }

    return res.status(200).json({ notification: latestNotification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getNotifications = async (req, res) => {
  const { receiver } = req.params;

  try {
    const notifications = await Notification.find({
      receiver,
      isRead: false,
    }).sort({ createdAt: 1 }); // oldest first

    if (notifications.length === 0) {
      return res.status(200).json({ message: "No new notifications." });
    }

    const notificationIds = notifications.map((n) => n._id);
    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


const addNotification = async (req, res) => {
  try {
    const { sender, receivers, message, videoTitle, videoUrl, hasVideo } = req.body;

    const allGroups = ["1-a", "1-b", "2-a", "2-b", "3-a", "3-b", "4-a", "4-b"];
    const actualReceivers = receivers.includes("ALL") ? allGroups : receivers;

    for (let receiver of actualReceivers) {
      const existing = await Notification.findOne({ receiver });

      if (existing) {
        existing.sender = sender;
        existing.message = message;
        existing.videoTitle = hasVideo ? videoTitle : null;
        existing.videoUrl = hasVideo ? videoUrl : null;
        existing.hasVideo = hasVideo;
        existing.createdAt = new Date();
        existing.isRead = false;
        await existing.save();
      } else {
        const newNotification = new Notification({
          sender,
          receiver,
          message,
          videoTitle: hasVideo ? videoTitle : null,
          videoUrl: hasVideo ? videoUrl : null,
          hasVideo,
        });
        await newNotification.save();
      }
    }

    return res.status(201).json({ 
      message: "Notification(s) processed successfully"
    });
  } catch (err) {
    console.error("Error in addNotification:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getNotifications,
  addNotification,
  getTestNotification,
};

