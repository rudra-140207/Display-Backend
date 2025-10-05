const { Notification } = require("../models/notification");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      const afterUpload = urlParts.slice(uploadIndex + 1);
      const filteredParts = afterUpload.filter(part => !/^v\d+$/.test(part));
      const lastPart = filteredParts[filteredParts.length - 1];
      const publicIdWithoutExt = lastPart.split('.')[0];
      filteredParts[filteredParts.length - 1] = publicIdWithoutExt;
      
      return filteredParts.join('/');
    }
    
    return url;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return url;
  }
};

const getCloudAssets = async (req, res) => {
  const { sender } = req.params;

  try {
    const messages = await Notification.find({ sender })
      .sort({ createdAt: -1 })
      .limit(50);

    const assets = [];
    
    messages.forEach(msg => {
      if (msg.hasImage && msg.imageUrl) {
        assets.push({
          id: `${msg._id}_image`,
          type: 'image',
          publicId: msg.imageUrl,
          title: msg.imageTitle,
          messageId: msg._id,
          createdAt: msg.createdAt,
          message: msg.message.substring(0, 50) + '...'
        });
      }
      
      if (msg.hasVideo && msg.videoUrl) {
        assets.push({
          id: `${msg._id}_video`,
          type: 'video',
          publicId: msg.videoUrl,
          title: msg.videoTitle,
          messageId: msg._id,
          createdAt: msg.createdAt,
          message: msg.message.substring(0, 50) + '...'
        });
      }
    });

    assets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ assets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteCloudAsset = async (req, res) => {
  const { publicId, resourceType } = req.body;

  try {
    console.log('Attempting to delete:', { publicId, resourceType });
    
    const extractedPublicId = extractPublicIdFromUrl(publicId);
    console.log('Extracted public ID:', extractedPublicId);
    
    const result = await cloudinary.uploader.destroy(extractedPublicId, {
      resource_type: resourceType,
      invalidate: true
    });

    console.log('Cloudinary deletion result:', result);

    if (result.result === 'ok' || result.result === 'not found') {
      return res.status(200).json({ 
        message: `${resourceType} deleted successfully from cloud`,
        result: result
      });
    } else {
      return res.status(400).json({ 
        error: `Failed to delete ${resourceType} from cloud`,
        result: result
      });
    }
  } catch (err) {
    console.error("Error deleting asset:", err);
    return res.status(500).json({ 
      error: "Server error",
      details: err.message 
    });
  }
};

const getTestNotification = async (req, res) => {
  const { receiver } = req.params;

  try {
    const latestNotification = await Notification.findOne({ receiver }).sort({
      createdAt: -1,
    });

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
    }).sort({ createdAt: 1 });

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

const getRecentMessages = async (req, res) => {
  const { sender } = req.params;

  try {
    const recentMessages = await Notification.aggregate([
      { $match: { sender } },
      { 
        $group: {
          _id: {
            message: '$message',
            hasImage: '$hasImage',
            hasVideo: '$hasVideo',
            imageTitle: '$imageTitle',
            videoTitle: '$videoTitle'
          },
          doc: { $first: '$$ROOT' },
          recipients: { $addToSet: '$receiver' },
          latestCreatedAt: { $max: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { latestCreatedAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: '$doc._id',
          sender: '$doc.sender',
          message: '$doc.message',
          videoTitle: '$doc.videoTitle',
          videoUrl: '$doc.videoUrl',
          imageTitle: '$doc.imageTitle',
          imageUrl: '$doc.imageUrl',
          hasVideo: '$doc.hasVideo',
          hasImage: '$doc.hasImage',
          createdAt: '$latestCreatedAt',
          recipients: 1,
          count: 1
        }
      }
    ]);

    return res.status(200).json({ messages: recentMessages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const addNotification = async (req, res) => {
  try {
    const {
      sender,
      receivers,
      message,
      videoTitle,
      videoUrl,
      hasVideo,
      imageTitle,
      imageUrl,
      hasImage,
    } = req.body;

    const allGroups = [
      "d-046",
      "d-047",
      "d-048",
      "d-116",
      "d-117",
      "d-118",
      "c-219",
    ];
    const actualReceivers = receivers.includes("ALL") ? allGroups : receivers;

    for (let receiver of actualReceivers) {
      const existing = await Notification.findOne({ receiver });

      if (existing) {
        if (existing.hasImage && existing.imageUrl && existing.imageUrl !== imageUrl) {
          const oldImagePublicId = extractPublicIdFromUrl(existing.imageUrl);
          if (oldImagePublicId) {
            cloudinary.uploader.destroy(oldImagePublicId, { resource_type: 'image' }).catch(console.error);
          }
        }
        
        if (existing.hasVideo && existing.videoUrl && existing.videoUrl !== videoUrl) {
          const oldVideoPublicId = extractPublicIdFromUrl(existing.videoUrl);
          if (oldVideoPublicId) {
            cloudinary.uploader.destroy(oldVideoPublicId, { resource_type: 'video' }).catch(console.error);
          }
        }

        existing.sender = sender;
        existing.message = message;
        existing.videoTitle = hasVideo ? videoTitle : null;
        existing.videoUrl = hasVideo ? videoUrl : null;
        existing.hasVideo = hasVideo;
        existing.imageTitle = hasImage ? imageTitle : null;
        existing.imageUrl = hasImage ? imageUrl : null;
        existing.hasImage = hasImage;
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
          imageTitle: hasImage ? imageTitle : null,
          imageUrl: hasImage ? imageUrl : null,
          hasImage,
        });
        await newNotification.save();
      }
    }

    return res.status(201).json({
      message: "Notification(s) processed successfully",
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
  getRecentMessages,
  getCloudAssets,
  deleteCloudAsset,
};
