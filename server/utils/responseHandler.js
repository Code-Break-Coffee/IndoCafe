/**
 * Standardized API Response Helper
 * Ensures consistent JSON structure across all endpoints.
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g., 200, 400, 500)
 * @param {any} data - The payload to return (object, array, or null)
 * @param {string} message - A human-readable message describing the result
 * @param {boolean} success - Boolean indicating success or failure
 */
export const sendResponse = (
  res,
  statusCode,
  data = null,
  message = '',
  success = true
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper for error responses
 */
export const sendError = (res, statusCode, message, error = null) => {
  return sendResponse(res, statusCode, error, message, false);
};
