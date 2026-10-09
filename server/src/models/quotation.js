const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
{
// The custom request this quotation belongs to
customRequest: {
type: mongoose.Schema.Types.ObjectId,
ref: "CustomRequest",
required: true,
},


// The artisan who sends the quotation
artisan: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ArtisanProfile",
  required: true,
},

// Proposed price for the work
price: {
  type: Number,
  required: true,
  min: 0,
},

// Estimated delivery duration in days
deliveryTime: {
  type: Number,
  required: true,
  min: 1,
},

// Additional details for the customer
message: {
  type: String,
  trim: true,
  maxlength: 1000,
  default: "",
},

// Quotation lifecycle
status: {
  type: String,
  enum: ["pending", "accepted", "rejected", "withdrawn"],
  default: "pending",
},

},
{
timestamps: true,
}
);

module.exports = mongoose.model("Quotation", quotationSchema);
