    const express = require("express");
    const router = express.Router();

    const { getAllUsers,
        updateUserStatus,
        getAdminStats,
        updateServiceStatusAdmin,
        getAllCustomRequestsAdmin,
        getAllQuotationsAdmin,
        getAdminOrderStats
    } = require("../controllers/adminController");

    const { getAllOrdersAdmin } = require("../controllers/orderController");
    
    const {
  getAllPaymentsAdmin,
  reviewPayment,
} = require("../controllers/paymentController");

  const {
  getAllServicesAdmin,
} = require("../controllers/adminController");

    const { protect } = require("../middleware/authMiddleware");
    const { authorizeRoles } = require("../middleware/roleMiddleware");

    const {
  getAdminActivityLogs,
} = require("../controllers/adminActivityLogController");

    router.get("/users", protect, authorizeRoles("admin"), getAllUsers);



    router.get(
    "/orders",
    protect,
    authorizeRoles("admin"),
    getAllOrdersAdmin
    );

    router.patch(
    "/users/:userId/status",
    protect,
    authorizeRoles("admin"),
    updateUserStatus
    );

   router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  getAdminStats
);

router.get(
  "/payments",
  protect,
  authorizeRoles("admin"),
  getAllPaymentsAdmin
);

router.patch(
  "/payments/:paymentId/review",
  protect,
  authorizeRoles("admin"),
  reviewPayment
);

router.get(
  "/services",
  protect,
  authorizeRoles("admin"),
  getAllServicesAdmin
);

router.patch(
  "/services/:serviceId/status",
  protect,
  authorizeRoles("admin"),
  updateServiceStatusAdmin
);


router.get(
  "/custom-requests",
  protect,
  authorizeRoles("admin"),
  getAllCustomRequestsAdmin
);

router.get(
  "/quotations",
  protect,
  authorizeRoles("admin"),
  getAllQuotationsAdmin
);

router.get(
  "/order-stats",
  protect,
  authorizeRoles("admin"),
  getAdminOrderStats
);

router.get(
  "/activity-logs",
  protect,
  authorizeRoles("admin"),
  getAdminActivityLogs
);

    module.exports = router;