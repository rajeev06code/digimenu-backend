const QRcode = require("../models/QRcode");
const generateQR = require("../utils/generateQR");

exports.createQRCode = async (req, res) => {
  try {
    const { restaurantName, tableNo } = req.body;

    // Check if a QR code already exists for the given restaurantName
    let existingQRCode = await QRcode.findOne({ restaurantName });

    if (existingQRCode) {
      // If duplicate found, return existing QR code
      return res.status(200).json({
        message: "QR Code already exists",
        qrCodeImage: existingQRCode.qrCodeImage,
        url: existingQRCode.url,
        tableNo: existingQRCode.tableNo,
      });
    }

    // Generate the URL for the QR code
    const url = `https://digimenu-backend-uuw2.onrender.com/${restaurantName}/${tableNo}/menu`;

    // Generate the QR code image
    const qrCodeImage = await generateQR(url);

    // Save the new QR code details to the database
    const newQRCode = new QRcode({ restaurantName, tableNo, url, qrCodeImage });
    await newQRCode.save();

    res.status(201).json({ qrCodeImage, url, tableNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
