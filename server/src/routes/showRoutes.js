import express from 'express';
import { listShows, getShowById, createShow, deleteShow } from '../controllers/showController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listShows);
router.get('/:id', getShowById);

// Admin-only endpoints
router.post('/', protect, requireAdmin, createShow);
router.delete('/:id', protect, requireAdmin, deleteShow);

export default router;
