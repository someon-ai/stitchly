
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  reviewDigitalPurchase,
  viewDigitalPaymentProof,
  getPendingDigitalPurchases,
} = require("../controllers/digitalPurchaseAdminController");

router.get(
  "/:purchaseId/payment-proof",
  protect,
  authorizeRoles("admin"),
  viewDigitalPaymentProof
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getPendingDigitalPurchases
);

router.patch(
  "/:purchaseId/review",
  protect,
  authorizeRoles("admin"),
  reviewDigitalPurchase
);

module.exports = router;
