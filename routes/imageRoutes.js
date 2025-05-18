const express = require("express");
const router = express.Router();
const {
  getImages,
  createImage,
  deleteImage,
} = require("../controllers/imageController");

router.get("/", getImages);
router.post("/", createImage);
router.delete("/:id", deleteImage);

module.exports = router;
