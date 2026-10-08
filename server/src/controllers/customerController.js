const CustomerProfile = require("../models/customerProfile");

// Create customer profile
const createCustomerProfile = async (req, res) => {
  try {
    const {
      phone,
      address,
      city,
      profileImage,
    } = req.body;

    const existingProfile = await CustomerProfile.findOne({
      user: req.user.userId,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Customer profile already exists",
      });
    }

    const profile = await CustomerProfile.create({
      user: req.user.userId,
      phone,
      address,
      city,
      profileImage,
    });

    res.status(201).json({
      success: true,
      message: "Customer profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Create customer profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get my customer profile
const getMyCustomerProfile = async (req, res) => {
  try {
    const profile = await CustomerProfile.findOne({
      user: req.user.userId,
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get customer profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update customer profile
const updateCustomerProfile = async (req, res) => {
  try {
    const {
      phone,
      address,
      city,
      profileImage,
    } = req.body;

    const profile = await CustomerProfile.findOne({
      user: req.user.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city;
    if (profileImage !== undefined) {
      profile.profileImage = profileImage;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update customer profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCustomerProfile,
  getMyCustomerProfile,
  updateCustomerProfile,
};