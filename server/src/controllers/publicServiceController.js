const ArtisanService = require("../models/artisanService");

const getAvailableServices = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = "1",
      limit = "10",
    } = req.query;

    // Build filters dynamically
    const filters = {
      isActive: true,
    };

    // Filter by category
    if (category) {
      filters.category = category;
    }

    // Search by title or description
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filters.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Validate and apply price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};

      if (minPrice !== undefined) {
        const minimum = Number(minPrice);

        if (!Number.isFinite(minimum) || minimum < 0) {
          return res.status(400).json({
            success: false,
            message: "minPrice must be a valid non-negative number",
          });
        }

        priceFilter.$gte = minimum;
      }

      if (maxPrice !== undefined) {
        const maximum = Number(maxPrice);

        if (!Number.isFinite(maximum) || maximum < 0) {
          return res.status(400).json({
            success: false,
            message: "maxPrice must be a valid non-negative number",
          });
        }

        priceFilter.$lte = maximum;
      }

      if (
        priceFilter.$gte !== undefined &&
        priceFilter.$lte !== undefined &&
        priceFilter.$gte > priceFilter.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: "minPrice cannot be greater than maxPrice",
        });
      }

      filters.price = priceFilter;
    }

    // Validate pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 50",
      });
    }

    // Choose an allowed sorting method
    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    if (!Object.hasOwn(sortOptions, sortBy)) {
      return res.status(400).json({
        success: false,
        message: "sortBy must be newest, price_asc, or price_desc",
      });
    }

    // Count matching services
    const total = await ArtisanService.countDocuments(filters);

    // Fetch one page of services
    const services = await ArtisanService.find(filters)
      .populate({
        path: "artisan",
        select:
          "businessName location experience specialties profileImage isVerified",
      })
      .sort(sortOptions[sortBy])
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      count: services.length,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      services,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching services",
    });
  }
};

module.exports = {
  getAvailableServices,
};