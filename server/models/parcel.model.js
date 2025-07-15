const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  pickupAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: true },

  parcelSize: { type: String, enum: ["Small", "Medium", "Large"], required: true },
  parcelType: { type: String, required: true }, // e.g., Electronics, Documents

  isPrepaid: { type: Boolean, default: true },
  codAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Pending", "Picked Up", "In Transit", "Delivered", "Failed"],
    default: "Pending",
  },

  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model("Parcel", parcelSchema);
