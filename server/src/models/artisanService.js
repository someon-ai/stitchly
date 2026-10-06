const mongoose = require("mongoose");

const artisanServiceSchema = new mongoose.Schema(
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
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    category: {
  type: String,
  required: true,
  trim: true,
  enum: [
    "Traditional Embroidery",
    "Hand Embroidery",
    "Machine Embroidery",
    "Bridal Embroidery",
    "Custom Embroidery",
    "Embroidery Designs",
  ],
},

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    deliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ArtisanService", artisanServiceSchema);