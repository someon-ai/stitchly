const Order = require("../models/order");
const Quotation = require("../models/quotation");
const CustomRequest = require("../models/customRequest");
const ArtisanProfile = require("../models/artisanProfile");
const Notification = require("../models/notification");

const createOrderFromQuotation = async (req, res) => {
try {
const { quotationId } = req.params;


const quotation = await Quotation.findById(quotationId);

if (!quotation) {
  return res.status(404).json({
    success: false,
    message: "Quotation not found.",
  });
}

if (quotation.status !== "accepted") {
  return res.status(400).json({
    success: false,
    message: "Only accepted quotations can become orders.",
  });
}

const customRequest = await CustomRequest.findById(
  quotation.customRequest
);

if (!customRequest) {
  return res.status(404).json({
    success: false,
    message: "Custom request not found.",
  });
}

if (customRequest.customer.toString() !== req.user.userId) {
  return res.status(403).json({
    success: false,
    message: "You cannot create an order for another customer's request.",
  });
}

const existingOrder = await Order.findOne({
  quotation: quotation._id,
});

if (existingOrder) {
  return res.status(409).json({
    success: false,
    message: "An order already exists for this quotation.",
    order: existingOrder,
  });
}

const order = await Order.create({
  customer: customRequest.customer,
  artisan: quotation.artisan,
  customRequest: customRequest._id,
  quotation: quotation._id,
  agreedPrice: quotation.price,
  deliveryTime: quotation.deliveryTime,
});

return res.status(201).json({
  success: true,
  message: "Order created successfully.",
  order,
});


} catch (error) {
console.error("Create order error:", error);


if (error.code === 11000) {
  return res.status(409).json({
    success: false,
    message: "An order already exists for this quotation.",
  });
}

return res.status(500).json({
  success: false,
  message: "Server error while creating the order.",
});

}
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.userId,
    })
      .populate("artisan", "businessName location")
      .populate("customRequest", "title description category quantity")
      .populate("quotation", "price deliveryTime message status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders.",
    });
  }
};


const getMyArtisanOrders = async (req, res) => {
  try {
    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found.",
      });
    }

    const orders = await Order.find({
      artisan: artisanProfile._id,
    })
      .populate("customer", "email")
      .populate("customRequest", "title description category quantity")
      .populate("quotation", "price deliveryTime message status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get artisan orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching artisan orders.",
    });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["in_progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      artisan: artisanProfile._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this artisan.",
      });
    }

    if (
      (order.status === "pending" && status !== "in_progress") ||
      (order.status === "in_progress" && status !== "completed") ||
      order.status === "completed"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order status transition is not allowed.",
      });
    }

    order.status = status;
    await order.save();

    try {
  await Notification.create({
    recipient: order.customer,
    type: "order_updated",
    title:
      status === "completed"
        ? "Order completed"
        : "Order in progress",
    message:
      status === "completed"
        ? "Your embroidery order has been marked as completed."
        : "Your artisan has started working on your embroidery order.",
    relatedId: order._id,
  });
} catch (notificationError) {
  console.error("Order notification failed:", notificationError);
}

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating order status.",
    });
  }
};


module.exports = {
createOrderFromQuotation,
getMyOrders,
getMyArtisanOrders,
updateOrderStatus,
};
