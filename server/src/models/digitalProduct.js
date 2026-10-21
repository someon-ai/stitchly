
const mongoose = require("mongoose");

const digitalProductSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtisanProfile",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    format: {
      type: String,
      enum: ["DST", "PES"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    previewImageKey: {
      type: String,
      required: true,
      trim: true,
    },

    previewImageFormat: {
      type: String,
      enum: ["PNG", "JPEG", "WEBP", "HEIC"],
      required: true,
    },

    fileKey: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },

    previewImageSize: {
      type: Number,
      required: true,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DigitalProduct", digitalProductSchema);
