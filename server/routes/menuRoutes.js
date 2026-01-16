import express from 'express';
import {
  createGlobalMenuItem,
  updateOutletItemStatus,
  getOutletMenu,
  getAllGlobalMenuItems,
} from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/public/menu/:outletId', getOutletMenu);

// Admin Routes
router
  .route('/admin/menu')
  .get(protect, authorize('SUPER_ADMIN'), getAllGlobalMenuItems)
  .post(protect, authorize('SUPER_ADMIN'), createGlobalMenuItem);

// Manager Routes
// Note: The controller expects req.user.defaultOutletId.
// Ensure your auth middleware or a specific middleware populates this for managers.
router.put(
  '/manager/menu/:itemId/status',
  protect,
  authorize('OUTLET_MANAGER'),
  updateOutletItemStatus
);

export default router;
