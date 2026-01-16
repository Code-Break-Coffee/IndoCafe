import mongoose from 'mongoose';

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['cloud_kitchen', 'dine_in', 'hybrid'],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
outletSchema.index({ location: '2dsphere' });

const Outlet = mongoose.model('Outlet', outletSchema);

export default Outlet;
