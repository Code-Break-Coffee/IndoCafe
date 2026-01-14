import express from 'express';
import {
  createPriceChangeRequest,
  getPendingPriceRequests,
  getAllPriceRequests,
  approvePriceRequest,
  rejectPriceRequest,
} from '../controllers/priceRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Manager - Create price change request
router.post('/', protect, createPriceChangeRequest);

// Admin - Get pending requests
router.get('/pending', protect, getPendingPriceRequests);

// Admin - Get all requests (with optional status filter)
router.get('/', protect, getAllPriceRequests);

// Admin - Approve request
router.put('/:requestId/approve', protect, approvePriceRequest);

// Admin - Reject request
router.put('/:requestId/reject', protect, rejectPriceRequest);

export default router;
