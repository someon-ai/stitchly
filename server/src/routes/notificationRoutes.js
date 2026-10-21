
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

router.get("/", protect, getMyNotifications);

router.patch(
  "/:notificationId/read",
  protect,
  markNotificationAsRead
);

module.exports = router;
