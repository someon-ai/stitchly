
const express = require("express");

const {
  getAvailableServices,
} = require("../controllers/publicServiceController");

const router = express.Router();

router.get("/", getAvailableServices);

module.exports = router;