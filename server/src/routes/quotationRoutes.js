const express = require("express");

const {
createQuotation,
getMyQuotations,
respondToQuotation,
} = require("../controllers/quotationController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Artisans submit quotations
router.post(
"/",
protect,
authorizeRoles("artisan"),
createQuotation
);

// Customers view quotations for their own requests
router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyQuotations
);

// Customers accept or reject a quotation
router.patch(
  "/:quotationId/respond",
  protect,
  authorizeRoles("customer"),
  respondToQuotation
);


module.exports = router;
