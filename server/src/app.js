const express = require("express");
const cors = require("cors");
const publicServiceRoutes = require("./routes/publicServiceRoutes");

// Import all routes at the top
const authRoutes = require("./routes/authRoutes");
const artisanRoutes = require("./routes/artisanRoutes");
const artisanServiceRoutes = require("./routes/artisanServiceRoutes");
const customerRoutes = require("./routes/customerRoutes");
const customRequestRoutes = require("./routes/customRequestRoutes"); 
const quotationRoutes = require("./routes/quotationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const digitalProductRoutes = require("./routes/digitalProductRoutes");
const digitalPurchaseRoutes = require("./routes/digitalPurchaseRoutes");
const digitalPurchaseAdminRoutes = require("./routes/digitalPurchaseAdminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Stitchly API is running!",
  });
});

// Route middleware
app.use("/api/auth", authRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/artisans/services", artisanServiceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/custom-requests", customRequestRoutes); // <--- Mounted here
app.use("/api/services", publicServiceRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/digital-products", digitalProductRoutes);
app.use("/api/digital-purchases", digitalPurchaseRoutes);
app.use(
  "/api/admin/digital-purchases",
  digitalPurchaseAdminRoutes
);
app.use("/api/notifications", notificationRoutes);



module.exports = app;