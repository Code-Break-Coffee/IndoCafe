import PriceChangeRequest from '../models/PriceChangeRequest.js';
import OutletItemConfig from '../models/OutletItemConfig.js';
import MenuItem from '../models/MenuItem.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Create a new price change request
// @route   POST /api/manager/price-requests
// @access  Private (Outlet Manager)
export const createPriceChangeRequest = async (req, res) => {
  try {
    const { menuItemId, proposedPrice, outletId } = req.body;
    const managerId = req.user._id;

    if (!menuItemId || proposedPrice === undefined) {
      return sendResponse(
        res,
        400,
        null,
        'menuItemId and proposedPrice are required',
        false
      );
    }

    if (proposedPrice < 0) {
      return sendResponse(res, 400, null, 'Price cannot be negative', false);
    }

    // Get menu item details
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return sendResponse(res, 404, null, 'Menu item not found', false);
    }

    // Get current price from OutletItemConfig
    const outletConfig = await OutletItemConfig.findOne({
      outletId,
      menuItemId,
    });
    const currentPrice = outletConfig?.customPrice || menuItem.basePrice;

    // Check if same price request already exists and is pending
    const existingRequest = await PriceChangeRequest.findOne({
      menuItemId,
      outletId,
      status: 'pending',
    });

    if (existingRequest) {
      return sendResponse(
        res,
        400,
        null,
        'A price change request for this item is already pending',
        false
      );
    }

    // Create price change request
    const priceChangeRequest = await PriceChangeRequest.create({
      outletId,
      menuItemId,
      managerId,
      currentPrice,
      proposedPrice,
      menuItemName: menuItem.name,
    });

    await priceChangeRequest.populate('managerId', 'name email');

    sendResponse(
      res,
      201,
      priceChangeRequest,
      'Price change request created successfully',
      true
    );
  } catch (error) {
    console.error('Error creating price change request:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Get all pending price change requests
// @route   GET /api/admin/price-requests/pending
// @access  Private (Super Admin)
export const getPendingPriceRequests = async (req, res) => {
  try {
    const requests = await PriceChangeRequest.find({ status: 'pending' })
      .populate('managerId', 'name email')
      .populate('outletId', 'name')
      .populate('menuItemId', 'name')
      .sort({ createdAt: -1 });

    sendResponse(
      res,
      200,
      requests,
      'Pending price requests fetched successfully',
      true
    );
  } catch (error) {
    console.error('Error fetching pending price requests:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Get all price change requests history
// @route   GET /api/admin/price-requests
// @access  Private (Super Admin)
export const getAllPriceRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await PriceChangeRequest.find(filter)
      .populate('managerId', 'name email')
      .populate('outletId', 'name')
      .populate('menuItemId', 'name')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    sendResponse(
      res,
      200,
      requests,
      'Price requests fetched successfully',
      true
    );
  } catch (error) {
    console.error('Error fetching price requests:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Approve a price change request
// @route   PUT /api/admin/price-requests/:requestId/approve
// @access  Private (Super Admin)
export const approvePriceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user._id;

    const priceRequest = await PriceChangeRequest.findById(requestId);
    if (!priceRequest) {
      return sendResponse(
        res,
        404,
        null,
        'Price change request not found',
        false
      );
    }

    if (priceRequest.status !== 'pending') {
      return sendResponse(
        res,
        400,
        null,
        `Request is already ${priceRequest.status}`,
        false
      );
    }

    // Update OutletItemConfig with new price
    await OutletItemConfig.findOneAndUpdate(
      { outletId: priceRequest.outletId, menuItemId: priceRequest.menuItemId },
      { $set: { customPrice: priceRequest.proposedPrice } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Update price request status
    priceRequest.status = 'approved';
    priceRequest.approvedBy = adminId;
    await priceRequest.save();

    await priceRequest.populate('managerId', 'name email');
    await priceRequest.populate('outletId', 'name');
    await priceRequest.populate('menuItemId', 'name');
    await priceRequest.populate('approvedBy', 'name email');

    sendResponse(
      res,
      200,
      priceRequest,
      'Price change approved successfully',
      true
    );
  } catch (error) {
    console.error('Error approving price request:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};

// @desc    Reject a price change request
// @route   PUT /api/admin/price-requests/:requestId/reject
// @access  Private (Super Admin)
export const rejectPriceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const priceRequest = await PriceChangeRequest.findById(requestId);
    if (!priceRequest) {
      return sendResponse(
        res,
        404,
        null,
        'Price change request not found',
        false
      );
    }

    if (priceRequest.status !== 'pending') {
      return sendResponse(
        res,
        400,
        null,
        `Request is already ${priceRequest.status}`,
        false
      );
    }

    priceRequest.status = 'rejected';
    priceRequest.rejectionReason = reason || null;
    priceRequest.approvedBy = req.user._id;
    await priceRequest.save();

    await priceRequest.populate('managerId', 'name email');
    await priceRequest.populate('outletId', 'name');
    await priceRequest.populate('menuItemId', 'name');
    await priceRequest.populate('approvedBy', 'name email');

    sendResponse(res, 200, priceRequest, 'Price change request rejected', true);
  } catch (error) {
    console.error('Error rejecting price request:', error);
    sendResponse(res, 500, null, 'Server Error', false);
  }
};
