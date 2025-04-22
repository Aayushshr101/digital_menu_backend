// models/QRCode.js
import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.QRCode || mongoose.model('QRCode', QRCodeSchema);