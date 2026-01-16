import mongoose from 'mongoose';
import User from '../models/User.js';
import StaffProfile from '../models/StaffProfile.js';

export const createStaff = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      password,
      role,
      outletId,
      shiftStartTime,
      phoneNumber,
      position,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role || !outletId) {
      throw new Error('Missing required fields');
    }

    // Ensure email is a string to avoid NoSQL injection via query operators
    if (typeof email !== 'string') {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: { $eq: email } }).session(
      session
    );
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 1. Create User (password will be hashed by User model pre-save middleware)
    const newUser = new User({
      name,
      email,
      password, // Pass plain password, User model will hash it
      role,
      phoneNumber: phoneNumber || '000-000-0000', // Default if not provided
      position: position || '', // Optional position logic
      defaultOutletId: outletId,
      assignedOutlets: [outletId],
    });

    await newUser.save({ session });

    // 2. Create StaffProfile
    const newStaffProfile = new StaffProfile({
      user: newUser._id,
      outletId,
      shiftDetails: {
        startTime: shiftStartTime,
        endTime: '', // Can be updated later
        daysOff: [],
      },
    });

    await newStaffProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Staff created successfully',
      staff: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile: newStaffProfile,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

export const getStaffByOutlet = async (req, res) => {
  try {
    const { outletId } = req.params;

    const staffProfiles = await StaffProfile.find({ outletId })
      .populate('user', 'name email role phoneNumber')
      .sort({ createdAt: -1 });

    // Filter out profiles where user might be null (if user was deleted but profile wasn't - edge case)
    const validStaff = staffProfiles.filter((profile) => profile.user);

    const formattedStaff = validStaff.map((profile) => ({
      _id: profile.user._id, // Return User ID as the main ID
      profileId: profile._id,
      name: profile.user.name,
      email: profile.user.email,
      role: profile.user.role,
      phoneNumber: profile.user.phoneNumber,
      shiftDetails: profile.shiftDetails,
      currentStatus: profile.currentStatus,
    }));

    res.status(200).json(formattedStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { staffId } = req.params; // This is the User ID

    // Find the user to ensure they exist and get their role/outlet if needed
    const userToDelete = await User.findById(staffId).session(session);
    if (!userToDelete) {
      throw new Error('Staff not found');
    }

    // Delete User
    await User.findByIdAndDelete(staffId).session(session);

    // Delete StaffProfile
    await StaffProfile.findOneAndDelete({ user: staffId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};
