
const AdminActivityLog = require("../models/adminActivityLog");

// Record an admin action
const createAdminActivityLog = async ({
  adminId,
  action,
  targetType,
  targetId = null,
  details = {},
}) => {
  return AdminActivityLog.create({
    admin: adminId,
    action,
    targetType,
    targetId,
    details,
  });
};

// Get activity history (admin only)
const getAdminActivityLogs = async (req, res) => {
  try {
    const logs = await AdminActivityLog.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get admin activity logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin activity logs.",
    });
  }
};

module.exports = {
  createAdminActivityLog,
  getAdminActivityLogs,
};
