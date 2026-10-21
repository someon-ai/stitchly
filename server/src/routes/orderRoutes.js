const express = require("express");

const {
createOrderFromQuotation,
getMyOrders,
getMyArtisanOrders,
updateOrderStatus,
getAllOrdersAdmin
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
"/from-quotation/:quotationId",
protect,
authorizeRoles("customer"),
createOrderFromQuotation
);

router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyOrders
);

router.get(
  "/artisan/my",
  protect,
  authorizeRoles("artisan"),
  getMyArtisanOrders
);

router.patch(
  "/:orderId/status",
  protect,
  authorizeRoles("artisan"),
  updateOrderStatus
);

// Admin: Get all marketplace orders
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllOrdersAdmin
);

module.exports = router;
