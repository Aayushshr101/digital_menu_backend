import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    // Order reference
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
    },

    // Payment method (cash, esewa, etc.)
    method: {
      type: String,
      enum: ["cash", "esewa", "card"],
      required: true,
    },

    // Payment status
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Transaction ID from payment gateway
    transactionId: {
      type: String,
    },

    // Reference ID from eSewa
    refId: {
      type: String,
    },

    // Additional payment data
    paymentData: {
      type: Object,
    },

    // Timestamps
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", PaymentSchema);