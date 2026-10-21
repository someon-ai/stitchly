  const express = require("express");


  const {
    registerUser,
    loginUser,
    getMe,
    setupAdmin
  } = require("../controllers/authController");

  const { protect } = require("../middleware/authMiddleware");

  const { authorizeRoles } = require("../middleware/roleMiddleware");

  const router = express.Router();

  router.post("/register", registerUser);

  router.post("/login", loginUser);

  router.get("/me", protect, getMe);

  router.post("/setup-admin", setupAdmin);

  router.get(
    "/admin-test",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
      res.json({
        success: true,
        message: "Welcome Admin! You have access.",
      });
    }
  );

  
  module.exports = router;