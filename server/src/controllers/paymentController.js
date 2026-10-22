const Payment = require("../models/payment");
const Order = require("../models/order");
const mongoose = require("mongoose");
const {
  createAdminActivityLog,
} = require("./adminActivityLogController");

const submitPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, transactionReference, proofImage } = req.body;

    if (!method || !transactionReference?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Payment method and transaction reference are required.",
      });
    }

    const allowedMethods = [
      "bank_transfer",
      "easypaisa",
      "jazzcash",
    ];

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported payment method.",
      });
    }

    const order = await Order.findById(orderId).select("+customer");

   

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    
if (order.customer.toString() !== req.user.userId.toString()) {
  return res.status(403).json({
    success: false,
    message: "You cannot submit payment for another customer's order.",
  });
}


    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be submitted for a cancelled order.",
      });
    }

    const existingPayment = await Payment.findOne({
  order: order._id,
  status: { $in: ["pending", "verified"] },
});

if (
  existingPayment &&
  existingPayment.status !== "rejected"
) {
  return res.status(409).json({
    success: false,
    message:
      "A payment is already pending or has been verified for this order.",
  });
}

    const payment = await Payment.create({
      order: order._id,
      customer: order.customer,
      amount: order.agreedPrice,
      method,
      transactionReference: transactionReference.trim(),
      proofImage,
    });

    return res.status(201).json({
      success: true,
      message: "Payment submitted for verification.",
      payment,
    });
  } catch (error) {
    console.error("Submit payment error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A payment record already exists for this order.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while submitting payment.",
    });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "pending" })
      .populate("order", "agreedPrice status")
      .populate("customer", "email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get pending payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending payments.",
    });
  }
};


const getAllPaymentsAdmin = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name email")
      .populate("order", "agreedPrice status")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Admin get all payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching all payments.",
    });
  }
};



const reviewPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID.",
      });
    }

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be verified or rejected.",
      });
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending payments can be reviewed.",
      });
    }

    payment.status = status;
    payment.verifiedBy = req.user.userId;
    payment.verifiedAt = status === "verified" ? new Date() : null;
    payment.rejectionReason =
      status === "rejected" ? rejectionReason.trim() : "";

    await payment.save();

    try {
  await createAdminActivityLog({
    adminId: req.user.userId,
    action: "payment_reviewed",
    targetType: "Payment",
    targetId: payment._id.toString(),
    details: {
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
    },
  });
} catch (logError) {
  console.error("Failed to record admin activity:", logError);
}

    return res.status(200).json({
      success: true,
      message: "Payment review completed.",
      payment,
    });
  } catch (error) {
    console.error("Review payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while reviewing payment.",
    });
  }
};


const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      customer: req.user.userId,
    })
      .populate("order", "agreedPrice status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get my payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching your payments.",
    });
  }
};


module.exports = {
  submitPayment,
    getPendingPayments,
    reviewPayment,
    getMyPayments,
    getAllPaymentsAdmin
};
