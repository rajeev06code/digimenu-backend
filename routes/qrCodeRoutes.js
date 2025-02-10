const express = require("express");
const { createQRCode } = require("../controllers/qrCodeController");

const router = express.Router();

router.post("/qr-code/create", createQRCode);

module.exports = router;
