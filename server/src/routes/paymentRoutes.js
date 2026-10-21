
const express = require("express");

const {
  submitPayment,
  getPendingPayments,
  reviewPayment,
  getMyPayments,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Customer submits payment details
router.post(
  "/:orderId",
  protect,
  authorizeRoles("customer"),
  submitPayment
);

// Admin views payments awaiting verification
router.get(
  "/admin/pending",
  protect,
  authorizeRoles("admin"),
  getPendingPayments
);

// Admin verifies or rejects a payment
router.patch(
  "/:paymentId/review",
  protect,
  authorizeRoles("admin"),
  reviewPayment
);

router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyPayments
);

module.exports = router;
