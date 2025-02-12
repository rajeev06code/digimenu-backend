const QRcode = require("../models/QRcode");
const generateQR = require("../utils/generateQR");
const crypto = require("crypto");

exports.createQRCode = async (req, res) => {
  try {
    const { restaurantName, tableNo } = req.body;

    // Check if a QR code already exists for the given restaurant and table number
    let existingQRCode = await QRcode.findOne({
      restaurantName,
      tableNo,
    });

    if (existingQRCode) {
      // If duplicate found, return existing QR code with restaurantId
      return res.status(200).json({
        message: "QR Code already exists",
        qrCodeImage: existingQRCode.qrCodeImage,
        url: existingQRCode.url,
        tableNo: existingQRCode.tableNo,
        restaurantId: existingQRCode.restaurantId,
        restaurantName: existingQRCode.restaurantName,
      });
    }

    // Generate a unique restaurant ID if this is the first table
    const existingRestaurant = await QRcode.findOne({ restaurantName });
    const restaurantId = existingRestaurant
      ? existingRestaurant.restaurantId
      : crypto.randomBytes(8).toString("hex");

    // Generate the URL for the QR code with restaurantId
    // const url = `https://digimenu-frontend.vercel.app/r/${restaurantId}/${tableNo}/menu`;
    const url = `https://digimenu-frontend.vercel.app/menu/${restaurantId}/${tableNo}`;

    // Generate the QR code image
    // Generate the QR code image
    const qrCodeImage = await generateQR(url);

    // Save the new QR code details to the database
    const newQRCode = new QRcode({
      restaurantName,
      restaurantId,
      tableNo,
      url,
      qrCodeImage,
    });
    await newQRCode.save();

    res.status(201).json({
      message: "QR Code created successfully",
      qrCodeImage,
      url,
      tableNo,
      restaurantId,
      restaurantName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New function to handle QR code scans and create sessions
exports.createTableSession = async (req, res) => {
  try {
    const { restaurantId, tableNo } = req.params;

    // Find the QR code for this restaurant and table
    const qrCode = await QRcode.findOne({ restaurantId, tableNo });

    if (!qrCode) {
      return res.status(404).json({
        error: "Invalid QR code",
      });
    }

    // Clean up expired sessions
    const now = new Date();
    qrCode.activeSessions = qrCode.activeSessions.filter(
      (session) => session.expiryTime > now && session.isActive
    );

    // Generate new session
    const sessionId = crypto.randomBytes(16).toString("hex");
    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes

    // Add new session
    qrCode.activeSessions.push({
      sessionId,
      startTime,
      expiryTime,
      isActive: true,
      tableNo,
    });

    await qrCode.save();

    res.status(200).json({
      message: "Session created successfully",
      sessionId,
      restaurantId,
      restaurantName: qrCode.restaurantName,
      tableNo,
      expiryTime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Validate active session
exports.validateSession = async (req, res) => {
  try {
    const { sessionId, restaurantId, tableNo } = req.body;

    const qrCode = await QRcode.findOne({
      restaurantId,
      tableNo,
      "activeSessions.sessionId": sessionId,
    });

    if (!qrCode) {
      return res.status(403).json({
        error: "Invalid session",
      });
    }

    const session = qrCode.activeSessions.find(
      (s) => s.sessionId === sessionId
    );

    if (!session || !session.isActive || session.expiryTime < new Date()) {
      return res.status(403).json({
        error: "Session expired. Please scan QR code again",
      });
    }

    res.status(200).json({
      valid: true,
      restaurantName: qrCode.restaurantName,
      tableNo: session.tableNo,
      expiryTime: session.expiryTime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// End session early if needed
exports.endSession = async (req, res) => {
  try {
    const { sessionId, restaurantId, tableNo } = req.body;

    const qrCode = await QRcode.findOne({
      restaurantId,
      tableNo,
      "activeSessions.sessionId": sessionId,
    });

    if (!qrCode) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    // Mark session as inactive
    const sessionIndex = qrCode.activeSessions.findIndex(
      (s) => s.sessionId === sessionId
    );

    if (sessionIndex !== -1) {
      qrCode.activeSessions[sessionIndex].isActive = false;
      await qrCode.save();
    }

    res.status(200).json({
      message: "Session ended successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
