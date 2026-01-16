import mongoose from 'mongoose';

const staffProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    currentStatus: {
      type: String,
      enum: ['active', 'on_leave', 'terminated'],
      default: 'active',
      required: true,
    },
    shiftDetails: {
      startTime: String, // e.g., "09:00"
      endTime: String, // e.g., "17:00"
      daysOff: [String], // e.g., ["Monday"]
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups of active staff in an outlet
staffProfileSchema.index({ outletId: 1, currentStatus: 1 });

const StaffProfile = mongoose.model('StaffProfile', staffProfileSchema);

export default StaffProfile;
