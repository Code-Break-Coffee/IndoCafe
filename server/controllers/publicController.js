import Outlet from '../models/Outlet.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Get nearest outlet based on lat/lng
// @route   GET /api/public/outlets/nearest
// @access  Public
export const getNearestOutlet = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return sendResponse(res, 400, null, 'Latitude and Longitude are required', false);
    }

    const outlet = await Outlet.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      },
      isActive: true
    });

    if (!outlet) {
      return sendResponse(res, 404, null, 'No outlet found nearby', false);
    }

    sendResponse(res, 200, outlet, 'Nearest outlet found', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Get all active outlets
// @route   GET /api/public/outlets
// @access  Public
export const getAllOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.find({ isActive: true }).select('name address type location phoneNumber');
    sendResponse(res, 200, outlets, 'Outlets retrieved successfully', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};
