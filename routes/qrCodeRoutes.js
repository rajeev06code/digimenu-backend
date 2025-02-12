const express = require("express");
const { createQRCode } = require("../controllers/qrCodeController");
const qrCodeController = require("../controllers/qrCodeController");

const router = express.Router();

router.post("/qr-code/create", createQRCode);

// New session management routes
router.post(
  "/tables/:restaurantId/:tableNo/session",
  qrCodeController.createTableSession
);
router.post("/tables/validate-session", qrCodeController.validateSession);
router.post("/tables/end-session", qrCodeController.endSession);

module.exports = router;
