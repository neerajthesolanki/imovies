import express from 'express';
import {
  holdSelectedSeats,
  releaseSeats,
  createBookingAndPay,
  getMyBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/hold', protect, holdSelectedSeats);
router.post('/release', protect, releaseSeats);
router.post('/checkout', protect, createBookingAndPay);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

export default router;
