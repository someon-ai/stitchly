const Order = require("../models/order");
const Quotation = require("../models/quotation");
const CustomRequest = require("../models/customRequest");

const createOrderFromQuotation = async (req, res) => {
try {
const { quotationId } = req.params;


const quotation = await Quotation.findById(quotationId);

if (!quotation) {
  return res.status(404).json({
    success: false,
    message: "Quotation not found.",
  });
}

if (quotation.status !== "accepted") {
  return res.status(400).json({
    success: false,
    message: "Only accepted quotations can become orders.",
  });
}

const customRequest = await CustomRequest.findById(
  quotation.customRequest
);

if (!customRequest) {
  return res.status(404).json({
    success: false,
    message: "Custom request not found.",
  });
}

if (customRequest.customer.toString() !== req.user.userId) {
  return res.status(403).json({
    success: false,
    message: "You cannot create an order for another customer's request.",
  });
}

const existingOrder = await Order.findOne({
  quotation: quotation._id,
});

if (existingOrder) {
  return res.status(409).json({
    success: false,
    message: "An order already exists for this quotation.",
    order: existingOrder,
  });
}

const order = await Order.create({
  customer: customRequest.customer,
  artisan: quotation.artisan,
  customRequest: customRequest._id,
  quotation: quotation._id,
  agreedPrice: quotation.price,
  deliveryTime: quotation.deliveryTime,
});

return res.status(201).json({
  success: true,
  message: "Order created successfully.",
  order,
});


} catch (error) {
console.error("Create order error:", error);


if (error.code === 11000) {
  return res.status(409).json({
    success: false,
    message: "An order already exists for this quotation.",
  });
}

return res.status(500).json({
  success: false,
  message: "Server error while creating the order.",
});


}
};

module.exports = {
createOrderFromQuotation,
};
