var QRCode = require("qrcode");

const generateQR = async (url) => {
  try {
    // Generate QR code as a data URL (base64 encoded image)
    const qrCodeImage = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H", // High error correction
      type: "image/png", // Output format
      margin: 2, // Margin around the QR code
      width: 300, // Width of the QR code image
      color: {
        dark: "#000000", // Dark color (QR code dots)
        light: "#ffffff", // Light color (background)
      },
    });

    return qrCodeImage;
  } catch (err) {
    throw new Error(`Failed to generate QR code: ${err.message}`);
  }
};

module.exports = generateQR;
