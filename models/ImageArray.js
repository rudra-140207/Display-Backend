const mongoose = require("mongoose");

const imageArraySchema = new mongoose.Schema({
  imageArray: [{ type: String }],
});

module.exports = mongoose.model("ImageArray", imageArraySchema);
