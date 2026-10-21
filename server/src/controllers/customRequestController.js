const CustomRequest = require("../models/customRequest");

// Create a custom embroidery request
const createCustomRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      fabric,
      quantity,
      requestedDeliveryTime,
      budgetMin,
      budgetMax,
      referenceImages,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      quantity === undefined ||
      requestedDeliveryTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, category, quantity, and requestedDeliveryTime are required",
      });
    }

    // Validate budget range
    if (
      budgetMin !== undefined &&
      budgetMin !== null &&
      (!Number.isFinite(budgetMin) || budgetMin < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "budgetMin must be a non-negative number",
      });
    }

    if (
      budgetMax !== undefined &&
      budgetMax !== null &&
      (!Number.isFinite(budgetMax) || budgetMax < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "budgetMax must be a non-negative number",
      });
    }

    if (
      budgetMin != null &&
      budgetMax != null &&
      budgetMin > budgetMax
    ) {
      return res.status(400).json({
        success: false,
        message: "budgetMin cannot exceed budgetMax",
      });
    }

    const customRequest = await CustomRequest.create({
      customer: req.user.userId,
      title,
      description,
      category,
      fabric,
      quantity,
      requestedDeliveryTime,
      budgetMin,
      budgetMax,
      referenceImages,
    });

    try {
  await Notification.create({
    recipient: req.user.userId,
    type: "custom_request_updated",
    title: "Custom request submitted",
    message: "Your custom embroidery request has been submitted successfully.",
    relatedId: customRequest._id,
  });
} catch (notificationError) {
  console.error("Custom request notification failed:", notificationError);
}

    return res.status(201).json({
      success: true,
      message: "Custom embroidery request created successfully",
      customRequest,
    });
  } catch (error) {
    console.error("Create custom request error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all open requests for artisans
const getOpenCustomRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({
      status: { $in: ["pending", "quoted"] },
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get open requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get requests created by the logged-in customer
const getMyCustomRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({
      customer: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my custom requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCustomRequest,
  getOpenCustomRequests,
  getMyCustomRequests,
};

