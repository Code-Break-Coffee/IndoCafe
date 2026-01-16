import express from 'express';
import {
  getNearestOutlet,
  getAllOutlets,
  getOutletTablesPublic,
  getTableByIdPublic,
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/outlets/nearest', getNearestOutlet);
router.get('/outlets', getAllOutlets);
router.get('/outlet/:outletId/tables', getOutletTablesPublic);
router.get('/table/:tableId', getTableByIdPublic);

export default router;
