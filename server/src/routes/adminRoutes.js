    const express = require("express");
    const router = express.Router();

    const { getAllUsers,
        updateUserStatus,
        getAdminStats,
        updateServiceStatusAdmin,
    } = require("../controllers/adminController");

    const { getAllOrdersAdmin } = require("../controllers/orderController");
    
    const { getAllPaymentsAdmin } =
  require("../controllers/paymentController");
  const {
  getAllServicesAdmin,
} = require("../controllers/adminController");

    const { protect } = require("../middleware/authMiddleware");
    const { authorizeRoles } = require("../middleware/roleMiddleware");

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

router.patch("/test-route", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin PATCH route is working!"
  });
});
    module.exports = router;