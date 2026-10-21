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

// Get all active services (public)
router.get("/", getAllActiveServices);

// Create an artisan service
router.post(
  "/",
  protect,
  authorizeRoles("artisan"),
  createService
);

// Get services belonging to the logged-in artisan
router.get(
  "/my",
  protect,
  authorizeRoles("artisan"),
  getMyServices
);

// Get one active service by ID (public)
router.get("/:serviceId", getServiceById);

// Update artisan service availability
router.patch(
  "/:serviceId/availability",
  protect,
  authorizeRoles("artisan"),
  updateServiceAvailability
);

// Update an artisan service
router.patch(
  "/:serviceId",
  protect,
  authorizeRoles("artisan"),
  updateService
);

// Delete an artisan service
router.delete(
  "/:serviceId",
  protect,
  authorizeRoles("artisan"),
  deleteService
);

module.exports = router;