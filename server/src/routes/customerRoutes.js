const express = require("express");

const {
  createCustomerProfile,
  getMyCustomerProfile,
  updateCustomerProfile,
} = require("../controllers/customerController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("customer"),
  createCustomerProfile
);

router.get(
  "/profile/me",
  protect,
  authorizeRoles("customer"),
  getMyCustomerProfile
);

router.patch(
  "/profile",
  protect,
  authorizeRoles("customer"),
  updateCustomerProfile
);

module.exports = router;