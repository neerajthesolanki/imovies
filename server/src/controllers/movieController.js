import Movie from '../models/Movie.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const listMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, sort, page = 1, limit = 12 } = req.query;

    if (dbState.isConnected) {
      const query = {};

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }
      if (genre && genre !== 'All') {
        query.genre = genre;
      }
      if (language && language !== 'All') {
        query.language = language;
      }
      if (status && status !== 'All') {
        query.status = status;
      }

      let sortOptions = { releaseDate: -1 };
      if (sort === 'rating_desc') sortOptions = { rating: -1 };
      if (sort === 'rating_asc') sortOptions = { rating: 1 };
      if (sort === 'title_asc') sortOptions = { title: 1 };
      if (sort === 'title_desc') sortOptions = { title: -1 };

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Movie.countDocuments(query);
      const movies = await Movie.find(query).sort(sortOptions).skip(skip).limit(Number(limit));

      return sendResponse(res, 200, true, 'Movies fetched successfully.', movies, {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      });
    } else {
      let filtered = [...memoryStore.movies];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(m => m.title.toLowerCase().includes(s) || m.description.toLowerCase().includes(s));
      }
      if (genre && genre !== 'All') {
        filtered = filtered.filter(m => m.genre.includes(genre));
      }
      if (language && language !== 'All') {
        filtered = filtered.filter(m => m.language.toLowerCase() === language.toLowerCase());
      }
      if (status && status !== 'All') {
        filtered = filtered.filter(m => m.status === status);
      }

      if (sort === 'rating_desc') filtered.sort((a, b) => b.rating - a.rating);
      else if (sort === 'rating_asc') filtered.sort((a, b) => a.rating - b.rating);
      else if (sort === 'title_asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
      else if (sort === 'title_desc') filtered.sort((a, b) => b.title.localeCompare(a.title));

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const movies = filtered.slice(skip, skip + Number(limit));

      return sendResponse(res, 200, true, 'Movies fetched successfully.', movies, {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbState.isConnected) {
      const movie = await Movie.findById(id);
      if (!movie) return sendError(res, 404, 'Movie not found.');
      return sendResponse(res, 200, true, 'Movie details retrieved.', movie);
    } else {
      const movie = memoryStore.movies.find(m => m._id.toString() === id.toString());
      if (!movie) return sendError(res, 404, 'Movie not found.');
      return sendResponse(res, 200, true, 'Movie details retrieved.', movie);
    }
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movieData = req.body;

    if (dbState.isConnected) {
      const movie = await Movie.create(movieData);
      return sendResponse(res, 201, true, 'Movie added successfully.', movie);
    } else {
      const newMovie = {
        _id: 'mov_' + Date.now().toString(36),
        ...movieData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.movies.unshift(newMovie);
      return sendResponse(res, 201, true, 'Movie added successfully.', newMovie);
    }
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbState.isConnected) {
      const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!movie) return sendError(res, 404, 'Movie not found.');
      return sendResponse(res, 200, true, 'Movie updated successfully.', movie);
    } else {
      const idx = memoryStore.movies.findIndex(m => m._id.toString() === id.toString());
      if (idx === -1) return sendError(res, 404, 'Movie not found.');
      memoryStore.movies[idx] = { ...memoryStore.movies[idx], ...req.body, updatedAt: new Date() };
      return sendResponse(res, 200, true, 'Movie updated successfully.', memoryStore.movies[idx]);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbState.isConnected) {
      const movie = await Movie.findByIdAndDelete(id);
      if (!movie) return sendError(res, 404, 'Movie not found.');
      return sendResponse(res, 200, true, 'Movie deleted successfully.');
    } else {
      const idx = memoryStore.movies.findIndex(m => m._id.toString() === id.toString());
      if (idx === -1) return sendError(res, 404, 'Movie not found.');
      memoryStore.movies.splice(idx, 1);
      return sendResponse(res, 200, true, 'Movie deleted successfully.');
    }
  } catch (error) {
    next(error);
  }
};
