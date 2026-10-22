
const User = require("../models/user");
const ArtisanProfile = require("../models/artisanProfile");
const Order = require("../models/order");
const Payment = require("../models/payment");
const ArtisanService = require("../models/artisanService");
const CustomRequest = require("../models/customRequest");
const Quotation = require("../models/quotation");
const {
  createAdminActivityLog,
} = require("./adminActivityLogController");

// Get all registered users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deactivated through this route.",
      });
    }

    user.isActive = isActive;
    await user.save();

    try {
  await createAdminActivityLog({
    adminId: req.user.userId,
    action: isActive ? "user_activated" : "user_deactivated",
    targetType: "User",
    targetId: user._id.toString(),
    details: {
      role: user.role,
      isActive: user.isActive,
    },
  });
} catch (logError) {
  console.error("Failed to record admin activity:", logError);
}

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User account activated."
        : "User account deactivated.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user status.",
    });
  }
};



const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalArtisans,
      verifiedArtisans,
      totalOrders,
      totalPayments,
      totalCustomRequests,
      totalQuotations,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      ArtisanProfile.countDocuments(),
      ArtisanProfile.countDocuments({ isVerified: true }),
      Order.countDocuments(),
      Payment.countDocuments(),
      CustomRequest.countDocuments(),
      Quotation.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalArtisans,
        verifiedArtisans,
        totalOrders,
        totalPayments,
        totalCustomRequests,
        totalQuotations,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin statistics.",
    });
  }
};


const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await ArtisanService.find()
      .populate("artisan", "businessName location isVerified")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Admin get all services error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching all services.",
    });
  }
};


const updateServiceStatusAdmin = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const service = await ArtisanService.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isActive = isActive;
    await service.save();

    try {
  await createAdminActivityLog({
    adminId: req.user.userId,
    action: isActive ? "service_activated" : "service_deactivated",
    targetType: "ArtisanService",
    targetId: service._id.toString(),
    details: {
      isActive: service.isActive,
    },
  });
} catch (logError) {
  console.error("Failed to record admin activity:", logError);
}

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Service has been activated successfully."
        : "Service has been deactivated successfully.",
      service,
    });
  } catch (error) {
    console.error("Admin update service status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating service status.",
    });
  }
};

const getAllCustomRequestsAdmin = async (req, res) => {
  try {
    const requests = await CustomRequest.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Admin get all custom requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching custom requests.",
    });
  }
};

const getAllQuotationsAdmin = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("customRequest")
      .populate("artisan")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    console.error("Admin get all quotations error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quotations.",
    });
  }
};

const getAdminOrderStats = async (req, res) => {
  try {
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      orderStats,
    });
  } catch (error) {
    console.error("Admin order stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching order statistics.",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAdminStats,
  getAllServicesAdmin,
  updateServiceStatusAdmin,
  getAllCustomRequestsAdmin,
  getAllQuotationsAdmin,
  getAdminOrderStats,
};