const express = require("express");

const {
createOrderFromQuotation,
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

module.exports = router;
