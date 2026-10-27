import express from 'express';
import { listMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/movieController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listMovies);
router.get('/:id', getMovieById);

// Admin-only endpoints
router.post('/', protect, requireAdmin, createMovie);
router.put('/:id', protect, requireAdmin, updateMovie);
router.delete('/:id', protect, requireAdmin, deleteMovie);

export default router;
