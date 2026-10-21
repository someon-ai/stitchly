const DigitalProduct = require("../models/digitalProduct");
const DigitalPurchase = require("../models/digitalPurchase");
const path = require("path");
const fs = require("fs");

const createDigitalPurchase = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const product = await DigitalProduct.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Digital product not found or unavailable.",
      });
    }

    const existingArtisan = await require("../models/artisanProfile")
      .findById(product.artisan);

    if (
      existingArtisan &&
      existingArtisan.user.toString() === req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot purchase your own digital product.",
      });
    }

    const purchase = await DigitalPurchase.create({
      customer: req.user.userId,
      product: product._id,
      artisan: product.artisan,
      amount: product.price,
    });

    return res.status(201).json({
      success: true,
      message: "Digital purchase created. Payment is pending verification.",
      purchase,
    });
  } catch (error) {
    console.error("Digital purchase creation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create digital purchase.",
    });
  }
};



const submitDigitalPayment = async (req, res) => {
  let uploadedFile = null;

  try {
    uploadedFile = req.file || null;

    const { paymentMethod, transactionReference } = req.body;
    const { purchaseId } = req.params;

    if (
      !["bank_transfer", "easypaisa", "jazzcash"].includes(paymentMethod) ||
      typeof transactionReference !== "string" ||
      !transactionReference.trim()
    ) {
      if (uploadedFile) {
        await fs.promises.unlink(uploadedFile.path).catch(() => {});
      }

      return res.status(400).json({
        success: false,
        message: "Valid payment method and transaction reference are required.",
      });
    }

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Payment proof image is required.",
      });
    }

    if (!/^[a-f\d]{24}$/i.test(purchaseId)) {
      await fs.promises.unlink(uploadedFile.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: "Invalid purchase ID.",
      });
    }

    const purchase = await DigitalPurchase.findOne({
      _id: purchaseId,
      customer: req.user.userId,
    });

    if (!purchase) {
      await fs.promises.unlink(uploadedFile.path).catch(() => {});

      return res.status(404).json({
        success: false,
        message: "Digital purchase not found.",
      });
    }

    if (purchase.paymentStatus !== "pending") {
      await fs.promises.unlink(uploadedFile.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: "This purchase has already been reviewed.",
      });
    }

    purchase.paymentMethod = paymentMethod;
    purchase.transactionReference = transactionReference.trim();
    purchase.paymentSubmittedAt = new Date();
    purchase.paymentProofKey = uploadedFile.filename;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Payment details and proof submitted for admin verification.",
      purchase,
    });
  } catch (error) {
    if (uploadedFile) {
      await fs.promises.unlink(uploadedFile.path).catch(() => {});
    }

    console.error("Digital payment submission failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit payment details.",
    });
  }
};



const getMyDigitalPurchases = async (req, res) => {
  try {
    const purchases = await DigitalPurchase.find({
      customer: req.user.userId,
    })
      .populate("product", "title description format previewImageFormat price")
      .populate("artisan", "businessName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    console.error("Digital purchase history failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve digital purchase history.",
    });
  }
};


const downloadDigitalProduct = async (req, res) => {
  try {
    const purchase = await DigitalPurchase.findOne({
      _id: req.params.purchaseId,
      customer: req.user.userId,
      paymentStatus: "verified",
    }).populate("product", "title format fileKey");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Verified purchase not found.",
      });
    }

    const product = purchase.product;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Digital product not found.",
      });
    }

    // Only allow a filename, never a path supplied by a user.
    if (
      !product.fileKey ||
      path.basename(product.fileKey) !== product.fileKey
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid digital product file.",
      });
    }

    const uploadDirectory = path.resolve(
      __dirname,
      "../../private_uploads"
    );

    const filePath = path.resolve(
      uploadDirectory,
      product.fileKey
    );

    if (!filePath.startsWith(uploadDirectory + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path.",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Digital file is missing from storage.",
      });
    }

    const downloadName =
      `${product.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.` +
      product.format.toLowerCase();

    return res.download(filePath, downloadName, (error) => {
      if (error) {
        console.error("Digital download failed:", error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Unable to download digital product.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Digital download authorization failed:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to process digital download.",
      });
    }
  }
};



module.exports = {
  createDigitalPurchase,
  getMyDigitalPurchases,
  downloadDigitalProduct,
  submitDigitalPayment,
};
