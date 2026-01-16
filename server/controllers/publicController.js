import Outlet from '../models/Outlet.js';
import Table from '../models/Table.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Get nearest outlet based on lat/lng
// @route   GET /api/public/outlets/nearest
// @access  Public
export const getNearestOutlet = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return sendResponse(
        res,
        400,
        null,
        'Latitude and Longitude are required',
        false
      );
    }

    const outlet = await Outlet.findOne({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
        },
      },
      isActive: true,
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
    const outlets = await Outlet.find({ isActive: true }).select(
      'name address type location phoneNumber'
    );
    sendResponse(res, 200, outlets, 'Outlets retrieved successfully', true);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, error.message, false);
  }
};

// @desc    Get all tables for an outlet (for customer dine-in selection)
// @route   GET /api/public/outlet/:outletId/tables
// @access  Public
export const getOutletTablesPublic = async (req, res) => {
  try {
    const { outletId } = req.params;

    const tables = await Table.find({ outletId }).populate(
      'currentOrderId',
      'items status notes customerId'
    );

    // For each table, determine if it's occupied and include customer ID info
    const enrichedTables = tables.map((table) => {
      const tableObj = table.toObject();
      // A table is occupied if it has a currentOrderId and that order has an active status
      const isActive =
        table.currentOrderId &&
        table.currentOrderId.status &&
        ['placed', 'cooking', 'ready'].includes(table.currentOrderId.status);
      tableObj.isOccupied = isActive || table.isOccupied;
      // Include the customer ID of the order occupying the table
      if (table.currentOrderId && table.currentOrderId.customerId) {
        tableObj.orderCustomerId = table.currentOrderId.customerId;
      }
      return tableObj;
    });

    sendResponse(
      res,
      200,
      enrichedTables,
      'Tables retrieved successfully',
      true
    );
  } catch (error) {
    console.error('Error fetching tables:', error);
    sendResponse(res, 500, null, 'Failed to fetch tables', false);
  }
};

// @desc    Get a single table (for table deep links)
// @route   GET /api/public/table/:tableId
// @access  Public
export const getTableByIdPublic = async (req, res) => {
  try {
    const { tableId } = req.params;

    const table = await Table.findById(tableId)
      .populate('outletId', 'name address type location')
      .populate('currentOrderId', 'status customerId');

    if (!table) {
      return sendResponse(res, 404, null, 'Table not found', false);
    }

    const tableObj = table.toObject();
    const isActive =
      table.currentOrderId &&
      table.currentOrderId.status &&
      ['placed', 'cooking', 'ready'].includes(table.currentOrderId.status);
    tableObj.isOccupied = isActive || table.isOccupied;

    sendResponse(res, 200, tableObj, 'Table retrieved successfully', true);
  } catch (error) {
    console.error('Error fetching table:', error);
    sendResponse(res, 500, null, 'Failed to fetch table', false);
  }
};
