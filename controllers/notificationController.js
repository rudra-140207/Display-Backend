const { Notification } = require("../models/notification");

const getTestNotification = async (req, res) => {
  const { receiver } = req.params;

  try {
    const latestNotification = await Notification.findOne({ receiver })
      .sort({ createdAt: -1 }); // newest first

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
  const { sender, receiver, message } = req.body;

  try {
    const notification = new Notification({
      sender,   
      receiver,  
      message,  
    });    
    await notification.save();
    return res.status(201).json({ message: "Notification added successfully" });    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });     
  }  
};  

module.exports = {
  getNotifications,
  addNotification,
  getTestNotification
};  

