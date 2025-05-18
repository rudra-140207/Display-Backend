const fs = require("fs");
const pdf = require("pdf-parse");
const Activity = require("../models/Activity");
const ImageArray = require("../models/ImageArray");
const parseActivitiesFromText = require("../utils/parseActivities");

exports.uploadCalendar = async (req, res) => {
  try {
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const rawText = data.text;

    const activities = parseActivitiesFromText(rawText);
    await Activity.insertMany(activities);

    fs.unlinkSync(filePath);

    res.json({
      message: "Activities added",
      count: activities.length,
      text: rawText,
    });
  } catch (err) {
    console.error("PDF parsing failed:", err.message);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "PDF parsing failed" });
  }
};

exports.saveImageArray = async (req, res) => {
  try {
    const { imageArray } = req.body;

    if (!Array.isArray(imageArray)) {
      return res.status(400).json({ message: "Expected an array" });
    }

    if (imageArray.length > 10) {
      return res.status(400).json({ message: "Max 10 images allowed" });
    }

    const newArray = await ImageArray.create({ imageArray });

    return res.status(200).json({ message: "Array saved in DB", data: newArray });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
