const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  startTime: { type: Date, required: true },
  expiryTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  tableNo: { type: Number, required: true },
});

const qrCodeSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  restaurantId: { type: String, required: true },
  tableNo: { type: Number, required: true },
  url: { type: String, required: true },
  qrCodeImage: { type: String, required: true },
  activeSessions: [sessionSchema],
});

// Add a compound index for restaurantName and tableNo combination
qrCodeSchema.index({ restaurantName: 1, tableNo: 1 }, { unique: true });

module.exports = mongoose.model("QRCode", qrCodeSchema);
