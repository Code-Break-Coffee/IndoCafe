import mongoose from 'mongoose';

const priceChangeRequestSchema = new mongoose.Schema(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    proposedPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    menuItemName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups of pending requests
priceChangeRequestSchema.index({ status: 1, createdAt: -1 });
priceChangeRequestSchema.index({ outletId: 1, status: 1 });

const PriceChangeRequest = mongoose.model(
  'PriceChangeRequest',
  priceChangeRequestSchema
);

export default PriceChangeRequest;
