const CustomRequest = require("../models/customRequest");
const ArtisanProfile = require("../models/artisanProfile");
const ArtisanService = require("../models/artisanService");

const createCustomRequest = async (req, res) => {
  try {
    const {
      artisanId,
      serviceId,
      title,
      description,
      referenceImages,
      requestedDeliveryTime,
      budget,
    } = req.body;

    // Check required fields
    if (
      !artisanId ||
      !serviceId ||
      !title ||
      !description ||
      requestedDeliveryTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check artisan
    const artisan = await ArtisanProfile.findById(artisanId);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: "Artisan not found",
      });
    }

    // Check service
    const service = await ArtisanService.findOne({
      _id: serviceId,
      artisan: artisanId,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or is currently unavailable",
      });
    }

    // Create custom request
    const customRequest = await CustomRequest.create({
      customer: req.user.userId,
      artisan: artisanId,
      service: serviceId,
      title,
      description,
      referenceImages: referenceImages || [],
      requestedDeliveryTime,
      budget,
    });

    res.status(201).json({
      success: true,
      message: "Custom embroidery request created successfully",
      customRequest,
    });
  } catch (error) {
    console.error("Create custom request error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getArtisanRequests = async (req, res) => {
  try {
    // Find artisan profile of logged-in artisan
    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    // Find requests sent to this artisan
    const requests = await CustomRequest.find({
      artisan: artisanProfile._id,
    })
      .populate("customer", "name email")
      .populate("service", "title category price");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get artisan requests error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  createCustomRequest,
  getArtisanRequests,
};