const DigitalPurchase = require("../models/digitalPurchase");
const path = require("path");
const fs = require("fs");
const Notification = require("../models/notification");

const reviewDigitalPurchase = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["verified", "rejected"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be verified or rejected.",
      });
    }

    const purchase = await DigitalPurchase.findById(
      req.params.purchaseId
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Digital purchase not found.",
      });
    }

    if (purchase.paymentStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "This purchase has already been reviewed.",
      });
    }

    purchase.paymentStatus = paymentStatus;
purchase.reviewedBy = req.user.userId;
purchase.reviewedAt = new Date();

await purchase.save();

try {
  await Notification.create({
    recipient: purchase.customer,

    type:
      paymentStatus === "verified"
        ? "payment_verified"
        : "payment_rejected",

    title:
      paymentStatus === "verified"
        ? "Payment verified"
        : "Payment rejected",

    message:
      paymentStatus === "verified"
        ? "Your payment has been verified. Your digital embroidery download is now available."
        : "Your payment was rejected. Please review your payment details or contact support.",

    relatedId: purchase._id,
  });
} catch (notificationError) {
  console.error(
    "Digital payment notification failed:",
    notificationError
  );
}

    return res.status(200).json({
      success: true,
      message: `Digital purchase payment ${paymentStatus}.`,
      purchase,
    });
  } catch (error) {
    console.error("Digital purchase review failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review digital purchase.",
    });
  }
};

const viewDigitalPaymentProof = async (req, res) => {
  try {
    const purchase = await DigitalPurchase.findById(
      req.params.purchaseId
    );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Digital purchase not found.",
      });
    }

    if (!purchase.paymentProofKey) {
      return res.status(404).json({
        success: false,
        message: "Payment proof has not been uploaded.",
      });
    }

    const proofPath = path.resolve(
      __dirname,
      "../../private_uploads",
      purchase.paymentProofKey
    );

    const uploadDirectory = path.resolve(
      __dirname,
      "../../private_uploads"
    );

    if (!proofPath.startsWith(uploadDirectory + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment proof path.",
      });
    }

    await fs.promises.access(proofPath);

    return res.sendFile(proofPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Payment proof file not found.",
      });
    }

    console.error("Payment proof viewing failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to view payment proof.",
    });
  }
};

const getPendingDigitalPurchases = async (req, res) => {
  try {
    const purchases = await DigitalPurchase.find({
      paymentStatus: "pending",
    })
      .populate("customer", "email")
      .populate("product", "title format price")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    console.error("Fetching pending purchases failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch pending digital purchases.",
    });
  }
};

module.exports = { reviewDigitalPurchase, 
  viewDigitalPaymentProof,
  getPendingDigitalPurchases
};
