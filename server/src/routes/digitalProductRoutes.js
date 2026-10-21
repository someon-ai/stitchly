
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../config/upload");

const {
  createDigitalProduct,
  getActiveDigitalProducts,
  getDigitalProductById,
  getDigitalProductPreview,
  
} = require("../controllers/digitalProductController");

router.get("/", getActiveDigitalProducts);
router.get("/:productId", getDigitalProductById);
router.get("/:productId/preview", getDigitalProductPreview);

router.post(
  "/",
  protect,
  authorizeRoles("artisan"),
  upload.fields([
    { name: "previewImage", maxCount: 1 },
    { name: "designFile", maxCount: 1 },
  ]),
  createDigitalProduct
);



module.exports = router;
