
const mongoose = require("mongoose");

const adminActivityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    targetType: {
      type: String,
      required: true,
      trim: true,
    },

    targetId: {
      type: String,
      default: null,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AdminActivityLog",
  adminActivityLogSchema
);
