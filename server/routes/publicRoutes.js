import express from 'express';
import { getNearestOutlet, getAllOutlets } from '../controllers/publicController.js';

const router = express.Router();

router.get('/outlets/nearest', getNearestOutlet);
router.get('/outlets', getAllOutlets);

export default router;
