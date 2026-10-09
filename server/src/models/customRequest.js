const mongoose = require("mongoose");

const customRequestSchema = new mongoose.Schema(
  {
    // Customer who created the request
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic request information
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

    category: {
      type: String,
      required: true,
      enum: [
        "Traditional Embroidery",
        "Hand Embroidery",
        "Machine Embroidery",
        "Bridal Embroidery",
        "Custom Embroidery",
        "Embroidery Designs",
      ],
    },

    // Customer's requirements
    fabric: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    requestedDeliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },

    budgetMin: {
      type: Number,
      min: 0,
      default: null,
    },

    budgetMax: {
      type: Number,
      min: 0,
      default: null,
    },

    referenceImages: {
      type: [String],
      default: [],
    },

    // Request lifecycle
    status: {
      type: String,
      enum: [
        "pending",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
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

