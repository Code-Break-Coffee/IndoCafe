import express from 'express';
import {
  createOutlet,
  getAllOutlets,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to SUPER_ADMIN
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.route('/outlets').post(createOutlet).get(getAllOutlets);

router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
