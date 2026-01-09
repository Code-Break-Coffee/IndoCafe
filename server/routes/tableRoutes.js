import express from 'express';
import {
  getOutletTables,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/tableController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Base path will be /api/manager/tables (set in index.js)

router.get(
  '/:outletId',
  protect,
  authorize('SUPER_ADMIN', 'OUTLET_MANAGER', 'WAITER'),
  getOutletTables
);
router.post(
  '/',
  protect,
  authorize('SUPER_ADMIN', 'OUTLET_MANAGER'),
  createTable
);
router.put(
  '/:id',
  protect,
  authorize('SUPER_ADMIN', 'OUTLET_MANAGER', 'WAITER'),
  updateTable
); // Waite might update status
router.delete(
  '/:id',
  protect,
  authorize('SUPER_ADMIN', 'OUTLET_MANAGER'),
  deleteTable
);

export default router;
