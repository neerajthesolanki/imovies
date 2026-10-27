import express from 'express';
import { getDashboardStats, getAllBookings, getAllUsers } from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);

export default router;
