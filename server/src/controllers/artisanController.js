const ArtisanProfile = require("../models/artisanProfile");

// Create artisan profile
const createArtisanProfile = async (req, res) => {
  try {
    const {
      businessName,
      bio,
      location,
      experience,
      specialties,
      profileImage,
      phone,
    } = req.body;

    // Check required fields
    if (!businessName || !location || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: "Business name, location and experience are required",
      });
    }

    // Check if artisan already has a profile
    const existingProfile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Artisan profile already exists",
      });
    }

    const artisanProfile = await ArtisanProfile.create({
      user: req.user.userId,
      businessName,
      bio,
      location,
      experience,
      specialties,
      profileImage,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Artisan profile created successfully",
      profile: artisanProfile,
    });
  } catch (error) {
    console.error("Create artisan profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get logged-in artisan's profile
const getMyArtisanProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile.findOne({
      user: req.user.userId,
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get artisan profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createArtisanProfile,
  getMyArtisanProfile,
};