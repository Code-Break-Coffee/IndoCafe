import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendResponse } from '../utils/responseHandler.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password').populate('assignedOutlets', 'name _id');

      if (!req.user) {
        return sendResponse(res, 401, null, 'Not authorized, user not found', false);
      }

      next();
    } catch (error) {
      console.error(error);
      return sendResponse(res, 401, null, 'Not authorized, token failed', false);
    }
  }

  if (!token) {
    return sendResponse(res, 401, null, 'Not authorized, no token', false);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendResponse(res, 403, null, 'Not authorized as an admin', false);
  }
};
