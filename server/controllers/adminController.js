import Outlet from '../models/Outlet.js';
import User from '../models/User.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Create a new Outlet
// @route   POST /api/admin/outlets
// @access  Private (Super Admin)
export const createOutlet = async (req, res) => {
  try {
    const { name, address, type, phoneNumber, location } = req.body;

    const outlet = await Outlet.create({
      name,
      address,
      type,
      phoneNumber,
      location,
    });

    sendResponse(res, 201, outlet, 'Outlet created successfully', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Get all outlets (id and name only)
// @route   GET /api/admin/outlets
// @access  Private (Super Admin)
export const getAllOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.find({}, 'name _id type isActive');
    sendResponse(res, 200, outlets, 'Outlets retrieved successfully', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Create a new User (Manager/Staff)
// @route   POST /api/admin/users
// @access  Private (Super Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, outletId } = req.body;

    // Validate outletId for operational roles
    if (
      !outletId &&
      [
        'OUTLET_MANAGER',
        'CASHIER',
        'KITCHEN',
        'WAITER',
        'DISPATCHER',
        'RIDER',
      ].includes(role)
    ) {
      return sendResponse(
        res,
        400,
        null,
        'Outlet ID is required for operational roles',
        false
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, null, 'User already exists', false);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      defaultOutletId: outletId,
    });

    sendResponse(
      res,
      201,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        defaultOutletId: user.defaultOutletId,
      },
      'User created successfully',
      true
    );
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Display Users
// @route   GET /api/admin/users
// @access  Private (Super Admin)
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    // Build filter object
    const filter = {};
    if (role) {
      filter.role = role;
    }

    // Get users with optional role filter
    const users = await User.find(filter)
      .select('-password')
      .populate('defaultOutletId', 'name _id')
      .populate('assignedOutlets', 'name _id')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, users, 'Users retrieved successfully', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Update a User
// @route   PUT /api/admin/users/:id
// @access  Private (Super Admin)
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, phoneNumber, outletId } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, null, 'User not found', false);
    }

    if (
      !outletId &&
      [
        'OUTLET_MANAGER',
        'CASHIER',
        'KITCHEN',
        'WAITER',
        'DISPATCHER',
        'RIDER',
      ].includes(role)
    ) {
      return sendResponse(
        res,
        400,
        null,
        'Outlet ID is required for operational roles',
        false
      );
    }

    // Prevent email collision when updating
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return sendResponse(res, 400, null, 'Email already in use', false);
      }
      user.email = email;
    }

    user.name = name ?? user.name;
    user.role = role ?? user.role;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.defaultOutletId = outletId || null;

    await user.save();

    sendResponse(
      res,
      200,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        defaultOutletId: user.defaultOutletId,
      },
      'User updated successfully',
      true
    );
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Delete a User
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, null, 'User not found', false);
    }

    await user.deleteOne();

    sendResponse(res, 200, null, 'User deleted successfully', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};
