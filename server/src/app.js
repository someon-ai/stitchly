const express = require("express");
const cors = require("cors");
const publicServiceRoutes = require("./routes/publicServiceRoutes");

// Import all your routes cleanly at the top
const authRoutes = require("./routes/authRoutes");
const artisanRoutes = require("./routes/artisanRoutes");
const artisanServiceRoutes = require("./routes/artisanServiceRoutes");
const customerRoutes = require("./routes/customerRoutes");
const customRequestRoutes = require("./routes/customRequestRoutes"); 
const quotationRoutes = require("./routes/quotationRoutes");
const orderRoutes = require("./routes/orderRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Stitchly API is running!",
  });
});

// Hook up your route middleware
app.use("/api/auth", authRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/artisans/services", artisanServiceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/custom-requests", customRequestRoutes); // <--- Mounted here
app.use("/api/services", publicServiceRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;