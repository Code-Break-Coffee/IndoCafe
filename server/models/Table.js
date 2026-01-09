import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    floor: {
      type: Number,
      default: 1,
    },
    shape: {
      type: String,
      enum: ['rect-table', 'round-table', 'square-table'],
      default: 'rect-table',
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      rotation: { type: Number, default: 0 },
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique table labels within an outlet (and floor optional, but label usually unique per outlet)
tableSchema.index({ outletId: 1, label: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

export default Table;
