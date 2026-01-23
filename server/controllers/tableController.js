import Table from '../models/Table.js';
import Order from '../models/Order.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Get all tables for an outlet (or only assigned tables for waiters)
// @route   GET /api/manager/tables/:outletId
// @access  Private (Manager/Admin/Waiter)
export const getOutletTables = async (req, res) => {
  try {
    const { outletId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build filter: get all tables for the outlet (waiters can see all tables now)
    let filter = { outletId };
    // Removed waiter-specific filter since waiters need to see all tables for billing/availability management

    const tables = await Table.find(filter).populate(
      'currentOrderId',
      'items status notes customerId'
    );

    // Return tables with their stored isOccupied flag (only changed by manual release/reserve)
    const enrichedTables = tables.map((table) => {
      const tableObj = table.toObject();
      // Use the table's stored isOccupied flag - don't override based on order status
      // This ensures tables stay occupied until waiter manually releases them
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

// @desc    Create a new table
// @route   POST /api/manager/tables
// @access  Private (Manager/Admin)
export const createTable = async (req, res) => {
  try {
    const { outletId, label, capacity, floor, shape } = req.body;

    const table = await Table.create({
      outletId,
      label,
      capacity,
      floor: floor || 1,
      shape: shape || 'rect-table',
      position: { x: 50, y: 50 }, // Default position
    });

    sendResponse(res, 201, table, 'Table created successfully', true);
  } catch (error) {
    console.error('Error creating table:', error);
    if (error.code === 11000) {
      return sendResponse(
        res,
        400,
        null,
        'Table label already exists in this outlet',
        false
      );
    }
    sendResponse(res, 500, null, 'Failed to create table', false);
  }
};

// @desc    Update a table (e.g., position from floor plan, or details)
// @route   PUT /api/manager/tables/:id
// @access  Private (Manager/Admin)
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const table = await Table.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return sendResponse(res, 404, null, 'Table not found', false);
    }

    sendResponse(res, 200, table, 'Table updated successfully', true);
  } catch (error) {
    console.error('Error updating table:', error);
    sendResponse(res, 500, null, 'Failed to update table', false);
  }
};

// @desc    Delete a table
// @route   DELETE /api/manager/tables/:id
// @access  Private (Manager/Admin)
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByIdAndDelete(id);

    if (!table) {
      return sendResponse(res, 404, null, 'Table not found', false);
    }

    sendResponse(res, 200, null, 'Table deleted successfully', true);
  } catch (error) {
    console.error('Error deleting table:', error);
    sendResponse(res, 500, null, 'Failed to delete table', false);
  }
};

// @desc    Reserve a table
// @route   POST /api/waiter/tables/:tableId/reserve
// @access  Private (Waiter/Manager)
export const reserveTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { guestName, partySize, reservationTime } = req.body;

    if (!guestName || !partySize || !reservationTime) {
      return sendResponse(
        res,
        400,
        null,
        'Missing required fields: guestName, partySize, reservationTime',
        false
      );
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return sendResponse(res, 404, null, 'Table not found', false);
    }

    // Mark table as occupied
    table.isOccupied = true;
    await table.save();

    sendResponse(res, 200, table, 'Table reserved successfully', true);
  } catch (error) {
    console.error('Error reserving table:', error);
    sendResponse(res, 500, null, 'Failed to reserve table', false);
  }
};

// @desc    Release a table (mark as available)
// @route   POST /api/waiter/tables/:tableId/release
// @access  Private (Waiter/Manager)
export const releaseTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    // Generate new sessionId to invalidate old customer sessions
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const table = await Table.findByIdAndUpdate(
      tableId,
      { isOccupied: false, currentOrderId: null, sessionId: newSessionId },
      { new: true }
    );

    if (!table) {
      return sendResponse(res, 404, null, 'Table not found', false);
    }

    sendResponse(res, 200, table, 'Table released successfully', true);
  } catch (error) {
    console.error('Error releasing table:', error);
    sendResponse(res, 500, null, 'Failed to release table', false);
  }
};
