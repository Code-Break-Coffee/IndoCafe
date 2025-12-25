import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendResponse } from '../utils/responseHandler.js';

// Generate JWT
const generateToken = (id, role, outletId) => {
  return jwt.sign({ id, role, outletId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, outletId, adminSecret } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendResponse(res, 400, null, 'User already exists', false);
    }

    // Admin creation validation
    if (role === 'admin') {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return sendResponse(res, 403, null, 'Invalid admin secret', false);
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'staff',
      phoneNumber,
      defaultOutletId: role === 'admin' ? undefined : outletId, // Map outletId to defaultOutletId
      assignedOutlets: outletId ? [outletId] : [], // Initialize assignedOutlets with default
    });

    if (user) {
      sendResponse(res, 201, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        defaultOutletId: user.defaultOutletId,
        assignedOutlets: user.assignedOutlets,
        token: generateToken(user._id, user.role, user.defaultOutletId),
      }, 'User registered successfully', true);
    } else {
      sendResponse(res, 400, null, 'Invalid user data', false);
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).populate('assignedOutlets', 'name _id');

    if (user && (await user.matchPassword(password))) {
      sendResponse(res, 200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        defaultOutletId: user.defaultOutletId,
        assignedOutlets: user.assignedOutlets,
        token: generateToken(user._id, user.role, user.defaultOutletId),
      }, 'Login successful', true);
    } else {
      sendResponse(res, 401, null, 'Invalid credentials', false);
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      defaultOutletId: req.user.defaultOutletId,
      assignedOutlets: req.user.assignedOutlets,
      phoneNumber: req.user.phoneNumber
    };
    
    sendResponse(res, 200, user, 'User data retrieved', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};
