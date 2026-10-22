const mongoose = require("mongoose");
const ArtisanProfile = require("../models/artisanProfile");
const {
  createAdminActivityLog,
} = require("./adminActivityLogController");
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

// Update logged-in artisan's profile
const updateArtisanProfile = async (req, res) => {
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

    const profile = await ArtisanProfile.findOne({
      user: req.user.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Artisan profile not found",
      });
    }

    // Update only fields that were provided
    if (businessName !== undefined) profile.businessName = businessName;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (experience !== undefined) profile.experience = experience;
    if (specialties !== undefined) profile.specialties = specialties;
    if (profileImage !== undefined) profile.profileImage = profileImage;
    if (phone !== undefined) profile.phone = phone;

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Artisan profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update artisan profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllArtisans = async (req, res) => {
  try {
    const artisans = await ArtisanProfile.find()
      // {isVerified: true,}
      .populate("user", "name email role");

    res.status(200).json({
      success: true,
      count: artisans.length,
      artisans,
    });
  } catch (error) {
    console.error("Get all artisans error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getArtisanById = async (req, res) => {
  try {
    const { artisanId } = req.params;

    if (!mongoose.isValidObjectId(artisanId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid artisan ID",
  });
}

    const artisan = await ArtisanProfile.findById(artisanId)
      .populate("user", "name email role");

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: "Artisan not found",
      });
    }

    res.status(200).json({
      success: true,
      artisan,
    });
  } catch (error) {
    console.error("Get artisan by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin verifies an artisan profile

const verifyArtisan = async (req, res) => {
  try {
    const { artisanId } = req.params;

    if (!mongoose.isValidObjectId(artisanId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid artisan ID",
      });
    }

    const artisan = await ArtisanProfile.findById(artisanId);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: "Artisan not found",
      });
    }

    artisan.isVerified = true;
    await artisan.save();

    // Record the admin activity
    try {
      await createAdminActivityLog({
        adminId: req.user.userId,
        action: "artisan_verified",
        targetType: "ArtisanProfile",
        targetId: artisan._id.toString(),
        details: {
          isVerified: artisan.isVerified,
        },
      });
    } catch (logError) {
      console.error(
        "Failed to record admin activity:",
        logError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Artisan verified successfully",
      artisan,
    });
  } catch (error) {
    console.error("Verify artisan error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const updateArtisanVerification = async (req, res) => {
  try {
    const { artisanId } = req.params;
    const { isVerified } = req.body;

    // Check whether the artisan ID is valid
    if (!mongoose.isValidObjectId(artisanId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid artisan ID",
      });
    }

    // The admin must provide a boolean value
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be true or false",
      });
    }

    // Find the artisan profile
    const artisan = await ArtisanProfile.findById(artisanId);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: "Artisan not found",
      });
    }

    // Update the verification status
    artisan.isVerified = isVerified;
    await artisan.save();

    return res.status(200).json({
      success: true,
      message: isVerified
        ? "Artisan verified successfully"
        : "Artisan verification revoked successfully",
      artisan,
    });
  } catch (error) {
    console.error("Update artisan verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



module.exports = {
  createArtisanProfile,
  getMyArtisanProfile,
  updateArtisanProfile,
  getAllArtisans,
  getArtisanById,
  updateArtisanVerification,
  verifyArtisan
};