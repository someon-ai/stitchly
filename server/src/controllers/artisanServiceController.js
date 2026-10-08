const ArtisanService = require("../models/artisanService");
const ArtisanProfile = require("../models/artisanProfile");

// Create a new service
const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      deliveryTime,
      images,
      isActive,
    } = req.body;

    // Check required fields
    if (
      !title ||
      !description ||
      !category ||
      price === undefined ||
      deliveryTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required service fields must be provided",
      });
    }

    
    // Find the logged-in artisan's profile
    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    // Create service
    const service = await ArtisanService.create({
      artisan: artisanProfile._id,
      title,
      description,
      category,
      price,
      deliveryTime,
      images,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Artisan service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyServices = async (req, res) => {
  try {
    // Find the artisan profile of the logged-in user
    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }


    // Find all services belonging to this artisan
    const services = await ArtisanService.find({
      artisan: artisanProfile._id,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get artisan services error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update an existing artisan service
const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const {
      title,
      description,
      category,
      price,
      deliveryTime,
      images,
    } = req.body;

    // Find the logged-in artisan's profile
    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    // Find the service AND make sure it belongs to this artisan
    const service = await ArtisanService.findOne({
      _id: serviceId,
      artisan: artisanProfile._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you are not authorized to update it",
      });
    }

    // Update only the fields that were provided
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (deliveryTime !== undefined) service.deliveryTime = deliveryTime;
    if (images !== undefined) service.images = images;

    await service.save();

    res.status(200).json({
      success: true,
      message: "Artisan service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete an artisan service
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find the logged-in artisan's profile
    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    // Find the service AND make sure it belongs to this artisan
    const service = await ArtisanService.findOne({
      _id: serviceId,
      artisan: artisanProfile._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you are not authorized to delete it",
      });
    }

    // Delete the service
    await ArtisanService.deleteOne({
      _id: serviceId,
    });

    res.status(200).json({
      success: true,
      message: "Artisan service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateServiceAvailability = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const artisanProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!artisanProfile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    const service = await ArtisanService.findOne({
      _id: serviceId,
      artisan: artisanProfile._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you are not authorized",
      });
    }

    service.isActive = isActive;

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service availability updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service availability error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllActiveServices = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by minimum price
    if (minPrice !== undefined) {
      filter.price = {
        ...filter.price,
        $gte: Number(minPrice),
      };
    }

    // Filter by maximum price
    if (maxPrice !== undefined) {
      filter.price = {
        ...filter.price,
        $lte: Number(maxPrice),
      };
    }

    // Search by service title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const services = await ArtisanService.find(filter).populate({
      path: "artisan",
      select:
        "businessName bio location experience specialties profileImage isVerified",
    });

    res.status(200).json({
      success: true,
      count: services.length,
      filters: {
        category: category || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        search: search || null,
      },
      services,
    });
  } catch (error) {
    console.error("Get filtered services error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await ArtisanService.findOne({
      _id: serviceId,
      isActive: true,
    }).populate({
      path: "artisan",
      select:
        "businessName bio location experience specialties profileImage isVerified",
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or is currently unavailable",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  createService,
  getMyServices,
  updateService,
  deleteService,
  updateServiceAvailability,
  getAllActiveServices,
  getServiceById,
};