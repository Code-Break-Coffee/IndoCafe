import { sendResponse } from '../utils/responseHandler.js';

/**
 * Role-Based Access Control Middleware
 * @param {...String} allowedRoles - List of roles allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(
        res,
        401,
        null,
        'Not authorized, user not found',
        false
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        null,
        `User role '${req.user.role}' is not authorized to access this route`,
        false
      );
    }

    next();
  };
};
