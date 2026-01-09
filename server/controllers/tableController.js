import Table from '../models/Table.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Get all tables for an outlet
// @route   GET /api/manager/tables/:outletId
// @access  Private (Manager/Admin)
export const getOutletTables = async (req, res) => {
  try {
    const { outletId } = req.params;
    const tables = await Table.find({ outletId });
    sendResponse(res, 200, tables, 'Tables retrieved successfully', true);
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
