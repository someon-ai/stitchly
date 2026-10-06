  const express = require("express");
  const cors = require("cors");
  const artisanRoutes = require("./routes/artisanRoutes");
  const artisanServiceRoutes = require("./routes/artisanServiceRoutes");

  const authRoutes = require("./routes/authRoutes");
  

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Stitchly API is running!",
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/artisans", artisanRoutes);
  app.use("/api/artisans/services", artisanServiceRoutes);
  module.exports = app;