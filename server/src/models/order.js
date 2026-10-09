const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
customer: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},


artisan: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ArtisanProfile",
  required: true,
},

customRequest: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "CustomRequest",
  required: true,
},

quotation: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Quotation",
  required: true,
  unique: true,
},

agreedPrice: {
  type: Number,
  required: true,
  min: 0,
},

deliveryTime: {
  type: Number,
  required: true,
  min: 1,
},

status: {
  type: String,
  enum: [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
  ],
  default: "pending",
},
 

},
{
timestamps: true,
}
);

module.exports = mongoose.model("Order", orderSchema);
