import express from 'express';
import {
  createOrder,
  getOutletOrders,
  getTableOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Public
router.post('/public/orders', createOrder);
router.get('/public/orders/table/:tableId', getTableOrders);

// Manager, Waiter & Kitchen
router.get(
  '/manager/orders/:outletId',
  protect,
  authorize('OUTLET_MANAGER', 'SUPER_ADMIN', 'WAITER', 'KITCHEN'),
  getOutletOrders
);
router.put(
  '/manager/orders/:id/status',
  protect,
  authorize('OUTLET_MANAGER', 'SUPER_ADMIN', 'KITCHEN', 'WAITER'),
  updateOrderStatus
);

export default router;
