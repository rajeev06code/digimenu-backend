const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  tableNo: { type: Number, required: true },
  url: { type: String, required: true },
  qrCodeImage: { type: String, required: true },
});

module.exports = mongoose.model("QRCode", qrCodeSchema);
