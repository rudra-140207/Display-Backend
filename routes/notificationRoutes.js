const {
  getNotifications,
  addNotification,
  getTestNotification,
  getRecentMessages,
  getCloudAssets,
  deleteCloudAsset,
} = require("../controllers/notificationController");
const express = require("express");

const router = express.Router();

router.get("/:receiver", getTestNotification);
router.post("/", addNotification);
router.get("/recent/:sender", getRecentMessages);
router.get("/assets/:sender", getCloudAssets);
router.delete("/asset", deleteCloudAsset);

module.exports = router;
