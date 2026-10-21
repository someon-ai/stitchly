
const path = require("path");
const fs = require("fs/promises");
const ArtisanProfile = require("../models/artisanProfile");
const DigitalProduct = require("../models/digitalProduct");
const mongoose = require("mongoose");

const uploadDirectory = path.resolve(
  __dirname,
  "../../private_uploads"
);

const removeUploadedFiles = async (files = []) => {
  await Promise.all(
    files.map((file) =>
      fs.unlink(path.join(uploadDirectory, file.filename)).catch(() => {})
    )
  );
};

const createDigitalProduct = async (req, res) => {
  const files = Object.values(req.files || {}).flat();

  try {
    const previewImage = req.files?.previewImage?.[0];
    const designFile = req.files?.designFile?.[0];

    if (!previewImage || !designFile) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "Both a preview image and an embroidery file are required.",
      });
    }

    const designExtension = path.extname(designFile.originalname).toLowerCase();
    const previewExtension = path.extname(previewImage.originalname).toLowerCase();

    const designFormats = {
      ".dst": "DST",
      ".pes": "PES",
    };

    const previewFormats = {
      ".png": "PNG",
      ".jpg": "JPEG",
      ".jpeg": "JPEG",
      ".webp": "WEBP",
      ".heic": "HEIC",
    };

    const format = designFormats[designExtension];
    const previewImageFormat = previewFormats[previewExtension];
    const price = Number(req.body.price);

    if (
      !format ||
      !previewImageFormat ||
      !req.body.title?.trim() ||
      !req.body.description?.trim() ||
      req.body.price === undefined ||
      req.body.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "Provide a valid title, description, price, and supported files.",
      });
    }

    const artisan = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisan) {
      await removeUploadedFiles(files);

      return res.status(404).json({
        success: false,
        message: "Create your artisan profile before uploading a product.",
      });
    }

    const product = await DigitalProduct.create({
      artisan: artisan._id,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      format,
      price,
      previewImageKey: previewImage.filename,
      previewImageFormat,
      previewImageSize: previewImage.size,
      fileKey: designFile.filename,
      fileSize: designFile.size,
    });

    return res.status(201).json({
      success: true,
      message: "Digital product uploaded successfully.",
      product,
    });
  } catch (error) {
    await removeUploadedFiles(files);

    console.error("Digital product upload failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the digital product.",
    });
  }
};


const getActiveDigitalProducts = async (req, res) => {
  try {
    const products = await DigitalProduct.find({
      isActive: true,
    })
      .select("-fileKey -fileSize -previewImageKey")
      .populate(
        "artisan",
        "businessName location experience specialties profileImage isVerified"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Digital product catalog failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve digital products.",
    });
  }
};




const getDigitalProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid digital product ID.",
      });
    }

    const product = await DigitalProduct.findOne({
      _id: productId,
      isActive: true,
    })
      .select("-fileKey -fileSize -previewImageKey")
      .populate(
        "artisan",
        "businessName location experience specialties profileImage isVerified"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Digital product not found or unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Digital product details failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve digital product details.",
    });
  }
};


const getDigitalProductPreview = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid digital product ID.",
      });
    }

    const product = await DigitalProduct.findOne({
      _id: productId,
      isActive: true,
    }).select("previewImageKey previewImageFormat");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Digital product not found or unavailable.",
      });
    }

    const allowedExtensions = {
      PNG: ".png",
      JPEG: [".jpg", ".jpeg"],
      WEBP: ".webp",
      HEIC: ".heic",
    };

    const extension = path.extname(product.previewImageKey).toLowerCase();
    const allowed = allowedExtensions[product.previewImageFormat];

    if (
      !allowed ||
      !(Array.isArray(allowed) ? allowed : [allowed]).includes(extension)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid preview image format.",
      });
    }

    const uploadDirectory = path.resolve(
      __dirname,
      "../../private_uploads"
    );

    const filePath = path.resolve(
      uploadDirectory,
      product.previewImageKey
    );

    if (!filePath.startsWith(uploadDirectory + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preview image path.",
      });
    }

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Preview image not found in storage.",
      });
    }

    const contentTypes = {
      PNG: "image/png",
      JPEG: "image/jpeg",
      WEBP: "image/webp",
      HEIC: "image/heic",
    };

    res.set("Content-Type", contentTypes[product.previewImageFormat]);
    res.set("Cache-Control", "public, max-age=3600");

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Digital product preview failed:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to retrieve preview image.",
      });
    }
  }
};



module.exports = {
  createDigitalProduct,
  getActiveDigitalProducts,
  getDigitalProductById,
  getDigitalProductPreview,
};
