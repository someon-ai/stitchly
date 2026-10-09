const express = require("express");
const {
  createCustomRequest,
  getOpenCustomRequests,
  getMyCustomRequests,
} = require("../controllers/customRequestController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Customers create custom requests
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createCustomRequest
);

// Artisans browse all open requests
router.get(
  "/open",
  protect,
  authorizeRoles("artisan"),
  getOpenCustomRequests
);

// Customers view their own requests
router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyCustomRequests
);

module.exports = router;

