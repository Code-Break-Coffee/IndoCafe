import mongoose from 'mongoose';

const outletItemConfigSchema = new mongoose.Schema(
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    customPrice: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups
outletItemConfigSchema.index({ outletId: 1, menuItemId: 1 }, { unique: true });

const OutletItemConfig = mongoose.model(
  'OutletItemConfig',
  outletItemConfigSchema
);

export default OutletItemConfig;
