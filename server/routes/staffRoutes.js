import express from 'express';
import {
  createStaff,
  getStaffByOutlet,
  deleteStaff,
} from '../controllers/staffController.js';
import {
  getOutletTables,
  reserveTable,
  releaseTable,
} from '../controllers/tableController.js';
import { getTableOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Staff management routes (Manager/Admin only)
router.post('/', authorize('SUPER_ADMIN', 'OUTLET_MANAGER'), createStaff);
router.get(
  '/:outletId',
  authorize('SUPER_ADMIN', 'OUTLET_MANAGER'),
  getStaffByOutlet
);
router.delete(
  '/:staffId',
  authorize('SUPER_ADMIN', 'OUTLET_MANAGER'),
  deleteStaff
);

// Waiter-specific routes
// Get all tables for waiter's outlet
router.get(
  '/tables/:outletId',
  authorize('WAITER', 'OUTLET_MANAGER'),
  getOutletTables
);

// Get orders for a specific table
router.get(
  '/table/:tableId/orders',
  authorize('WAITER', 'OUTLET_MANAGER'),
  getTableOrders
);

// Reserve a table
router.post(
  '/tables/:tableId/reserve',
  authorize('WAITER', 'OUTLET_MANAGER'),
  reserveTable
);

// Release a table
router.post(
  '/tables/:tableId/release',
  authorize('WAITER', 'OUTLET_MANAGER'),
  releaseTable
);

export default router;
