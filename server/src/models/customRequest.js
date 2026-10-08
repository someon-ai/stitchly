const mongoose = require("mongoose");

const customRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtisanProfile",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtisanService",
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
      maxlength: 2000,
    },

    referenceImages: {
      type: [String],
      default: [],
    },

    requestedDeliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },

    budget: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "quoted",
        "accepted",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CustomRequest",
  customRequestSchema
);