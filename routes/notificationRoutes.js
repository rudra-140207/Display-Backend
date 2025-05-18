const {
  getNotifications,
  addNotification,
  getTestNotification,
} = require("../controllers/notificationController");
const express = require("express");

const router = express.Router();

// router.get("/:receiver", getNotifications);
router.get("/:receiver", getTestNotification);
router.post("/", addNotification);

module.exports = router;
