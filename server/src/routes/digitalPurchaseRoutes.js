const express = require("express");
const router = express.Router();
const paymentProofUpload = require("../config/paymentProofUpload");

const { protect } = require("../middleware/authMiddleware");
const {authorizeRoles} = require("../middleware/roleMiddleware");

const {
  createDigitalPurchase,
  getMyDigitalPurchases,
  downloadDigitalProduct,
  submitDigitalPayment,
} = require("../controllers/digitalPurchaseController");

router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createDigitalPurchase
);

router.patch(
  "/:purchaseId/payment",
  protect,
  authorizeRoles("customer"),
  paymentProofUpload.single("paymentProof"),
  submitDigitalPayment
);

router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyDigitalPurchases
);

router.get(
  "/:purchaseId/download",
  protect,
  authorizeRoles("customer"),
  downloadDigitalProduct
);

module.exports = router;
