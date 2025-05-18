const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadCalendar, saveImageArray } = require("../controllers/uploadController");

const upload = multer({ dest: "uploads/" });

router.post("/upload-calendar", upload.single("pdf"), uploadCalendar);
router.post("/imageDrawer", saveImageArray);

module.exports = router;
