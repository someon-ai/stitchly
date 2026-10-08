const express = require("express");

const {
  createArtisanProfile,
  getMyArtisanProfile,
  updateArtisanProfile,
  getAllArtisans,
  getArtisanById,
} = require("../controllers/artisanController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all artisans
router.get("/", getAllArtisans);

// Create artisan profile
router.post(
  "/profile",
  protect,
  authorizeRoles("artisan"),
  createArtisanProfile
);

// Get my artisan profile
router.get(
  "/profile/me",
  protect,
  authorizeRoles("artisan"),
  getMyArtisanProfile
);

// Update my artisan profile
router.patch(
  "/profile",
  protect,
  authorizeRoles("artisan"),
  updateArtisanProfile
);

// Get a specific artisan by ID
router.get("/profile/:artisanId", getArtisanById);

module.exports = router;