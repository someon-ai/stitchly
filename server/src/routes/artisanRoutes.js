const express = require("express");

const {
  createArtisanProfile,
  getMyArtisanProfile,
} = require("../controllers/artisanController");


const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

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

module.exports = router;