const Image = require("../models/Image");

exports.getImages = async (req, res) => {
  try {
    const images = await Image.find({}, "name imageUrl");
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createImage = async (req, res) => {
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
};

exports.deleteImage = async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image" });
  }
};
