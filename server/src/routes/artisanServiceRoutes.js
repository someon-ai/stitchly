const express = require("express");

const {
  createService,
  getMyServices,
  updateService,
  deleteService,
  updateServiceAvailability,
  getAllActiveServices,
  getServiceById,
} = require("../controllers/artisanServiceController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();
router.get("/",getAllActiveServices);


// Create artisan service
router.post(
  "/",
  protect,
  authorizeRoles("artisan"),
  createService
);

// Get my artisan services
router.get(
  "/my",
  protect,
  authorizeRoles("artisan"),
  getMyServices
);

router.get("/:serviceId", getServiceById);


// Update artisan service availability
router.patch(
    
  "/:serviceId/availability",
  protect,
  authorizeRoles("artisan"),
  updateServiceAvailability
)

// Update artisan service
router.patch(
  "/:serviceId",
  protect,
  authorizeRoles("artisan"),
  updateService
);

router.delete(
  "/:serviceId",
  protect,
  authorizeRoles("artisan"),
  deleteService,
  updateServiceAvailability
);

module.exports = router;