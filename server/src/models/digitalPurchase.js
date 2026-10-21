const mongoose = require("mongoose");

const digitalPurchaseSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DigitalProduct",
      required: true,
    },

    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtisanProfile",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    paymentMethod: {
  type: String,
  enum: ["bank_transfer", "easypaisa", "jazzcash"],
},

transactionReference: {
  type: String,
  trim: true,
},

paymentProofKey: {
  type: String,
},

paymentSubmittedAt: {
  type: Date,
},

reviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},

reviewedAt: {
  type: Date,
},

    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DigitalPurchase",
  digitalPurchaseSchema
);
