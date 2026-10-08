const express = require("express");

const {
  createCustomRequest,
  getArtisanRequests,
} = require("../controllers/customRequestController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();


// Customer creates custom request
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createCustomRequest
);

// Artisan views incoming requests
router.get(
  "/artisan",
  protect,
  authorizeRoles("artisan"),
  getArtisanRequests
);

module.exports = router;