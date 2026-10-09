const Quotation = require("../models/quotation");
const CustomRequest = require("../models/customRequest");
const ArtisanProfile = require("../models/artisanProfile");

// Artisan sends a quotation for a custom request
const createQuotation = async (req, res) => {
try {
const { customRequestId, price, deliveryTime, message } = req.body;


// Check required fields
if (
  !customRequestId ||
  price === undefined ||
  deliveryTime === undefined
) {
  return res.status(400).json({
    success: false,
    message: "Custom request, price, and delivery time are required.",
  });
}

// Validate price and delivery time
if (
  !Number.isFinite(price) ||
  price < 0 ||
  !Number.isInteger(deliveryTime) ||
  deliveryTime < 1
) {
  return res.status(400).json({
    success: false,
    message: "Price must be a non-negative number and delivery time must be at least 1 day.",
  });
}

// Find the logged-in artisan's profile
const artisanProfile = await ArtisanProfile.findOne({
  user: req.user.userId,
});

if (!artisanProfile) {
  return res.status(404).json({
    success: false,
    message: "Artisan profile not found. Please create your profile first.",
  });
}

// Find the custom request
const customRequest = await CustomRequest.findById(customRequestId);

if (!customRequest) {
  return res.status(404).json({
    success: false,
    message: "Custom request not found.",
  });
}

// Only open requests can receive quotations
if (customRequest.status !== "pending") {
  return res.status(400).json({
    success: false,
    message: "This request is no longer open for quotations.",
  });
}

// Prevent the same artisan from quoting twice
const existingQuotation = await Quotation.findOne({
  customRequest: customRequestId,
  artisan: artisanProfile._id,
});

if (existingQuotation) {
  return res.status(409).json({
    success: false,
    message: "You have already submitted a quotation for this request.",
  });
}

// Save the quotation
const quotation = await Quotation.create({
  customRequest: customRequestId,
  artisan: artisanProfile._id,
  price,
  deliveryTime,
  message,
});

return res.status(201).json({
  success: true,
  message: "Quotation submitted successfully.",
  quotation,
});

} catch (error) {
console.error("Create quotation error:", error);

return res.status(500).json({
  success: false,
  message: "Server error while submitting quotation.",
});
}
};

const getMyQuotations = async (req, res) => {
try {
// Find custom requests created by the logged-in customer
const CustomRequest = require("../models/customRequest");


const myRequests = await CustomRequest.find({
  customer: req.user.userId,
}).select("_id");

const requestIds = myRequests.map((request) => request._id);

// Find quotations for those requests
const quotations = await Quotation.find({
  customRequest: { $in: requestIds },
})
  .populate("artisan", "businessName location")
  .populate("customRequest", "title description category")
  .sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  count: quotations.length,
  quotations,
});


} catch (error) {
console.error("Get quotations error:", error);


return res.status(500).json({
  success: false,
  message: "Server error while fetching quotations.",
});


}
};

const respondToQuotation = async (req, res) => {
try {
const { action } = req.body;


if (!["accept", "reject"].includes(action)) {
  return res.status(400).json({
    success: false,
    message: 'Action must be either "accept" or "reject".',
  });
}

// Find the quotation
const quotation = await Quotation.findById(req.params.quotationId);

if (!quotation) {
  return res.status(404).json({
    success: false,
    message: "Quotation not found.",
  });
}

// Find the related custom request
const CustomRequest = require("../models/customRequest");

const customRequest = await CustomRequest.findById(
  quotation.customRequest
);

if (!customRequest) {
  return res.status(404).json({
    success: false,
    message: "Related custom request not found.",
  });
}

// Only the customer who created the request can respond
if (customRequest.customer.toString() !== req.user.userId) {
  return res.status(403).json({
    success: false,
    message: "You cannot respond to another customer's quotation.",
  });
}

// Prevent responding to a quotation more than once
if (quotation.status !== "pending") {
  return res.status(400).json({
    success: false,
    message: "This quotation has already been responded to.",
  });
}

// Don't allow another quotation to be accepted for an accepted request
if (
  action === "accept" &&
  customRequest.status !== "pending" &&
  customRequest.status !== "quoted"
) {
  return res.status(400).json({
    success: false,
    message: "This request can no longer accept a quotation.",
  });
}

if (action === "accept") {
  quotation.status = "accepted";
  customRequest.status = "accepted";

  // Reject other pending quotations for the same request
  await Quotation.updateMany(
    {
      customRequest: customRequest._id,
      _id: { $ne: quotation._id },
      status: "pending",
    },
    { $set: { status: "rejected" } }
  );

  await customRequest.save();
} else {
  quotation.status = "rejected";
}

await quotation.save();

return res.status(200).json({
  success: true,
  message:
    action === "accept"
      ? "Quotation accepted successfully."
      : "Quotation rejected successfully.",
  quotation,
});


} catch (error) {
console.error("Respond to quotation error:", error);


return res.status(500).json({
  success: false,
  message: "Server error while responding to quotation.",
});


}
};


 
module.exports = {
createQuotation,
getMyQuotations,
respondToQuotation,
};
