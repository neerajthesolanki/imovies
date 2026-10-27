import express from 'express';
import {
  listTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre
} from '../controllers/theatreController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listTheatres);
router.get('/:id', getTheatreById);

// Admin-only endpoints
router.post('/', protect, requireAdmin, createTheatre);
router.put('/:id', protect, requireAdmin, updateTheatre);
router.delete('/:id', protect, requireAdmin, deleteTheatre);

export default router;
