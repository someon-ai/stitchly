
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.resolve(__dirname, "../../private_uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${require("crypto").randomUUID()}${extension}`;

    callback(null, safeFilename);
  },
});

const allowedExtensions = new Set([
  ".dst",
  ".pes",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".heic",
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(new Error("This file extension is not supported."));
    }

    callback(null, true);
  },
});

module.exports = upload;
