import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = {
  GLOBAL: ['SUPER_ADMIN', 'AREA_MANAGER'],
  OPERATIONAL: [
    'OUTLET_MANAGER',
    'CASHIER',
    'WAITER',
    'KITCHEN',
    'DISPATCHER',
    'RIDER',
  ],
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [...ROLES.GLOBAL, ...ROLES.OPERATIONAL],
      default: 'CASHIER',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: false, // Optional, typically for Kitchen/Waiter specific roles
      trim: true,
    },
    defaultOutletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: function () {
        return ROLES.OPERATIONAL.includes(this.role);
      },
    },
    assignedOutlets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outlet',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt (skip when password not modified)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
