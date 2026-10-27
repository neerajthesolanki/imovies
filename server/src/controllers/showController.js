import Show from '../models/Show.js';
import Screen from '../models/Screen.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const listShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, date } = req.query;

    if (dbState.isConnected) {
      const query = { status: { $ne: 'cancelled' } };

      if (movieId) query.movie = movieId;
      if (theatreId) query.theatre = theatreId;
      if (date) {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
        query.showDate = { $gte: startOfDay, $lte: endOfDay };
      }

      const shows = await Show.find(query)
        .populate('movie', 'title posterUrl duration certificate language')
        .populate('theatre', 'name city address facilities')
        .populate('screen', 'name screenType totalCapacity')
        .sort({ showDate: 1, startTime: 1 });

      return sendResponse(res, 200, true, 'Shows fetched successfully.', shows);
    } else {
      let filtered = [...memoryStore.shows];

      if (movieId) {
        filtered = filtered.filter(s => (s.movie?._id || s.movie).toString() === movieId.toString());
      }
      if (theatreId) {
        filtered = filtered.filter(s => (s.theatre?._id || s.theatre).toString() === theatreId.toString());
      }
      if (date) {
        const dStr = new Date(date).toISOString().split('T')[0];
        filtered = filtered.filter(s => new Date(s.showDate).toISOString().split('T')[0] === dStr);
      }

      // Populate references
      const populated = filtered.map(s => {
        const movieObj = memoryStore.movies.find(m => m._id.toString() === (s.movie?._id || s.movie).toString());
        const theatreObj = memoryStore.theatres.find(t => t._id.toString() === (s.theatre?._id || s.theatre).toString());
        const screenObj = memoryStore.screens.find(sc => sc._id.toString() === (s.screen?._id || s.screen).toString());
        return {
          ...s,
          movie: movieObj || s.movie,
          theatre: theatreObj || s.theatre,
          screen: screenObj || s.screen
        };
      });

      return sendResponse(res, 200, true, 'Shows fetched successfully.', populated);
    }
  } catch (error) {
    next(error);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbState.isConnected) {
      const show = await Show.findById(id)
        .populate('movie')
        .populate('theatre')
        .populate('screen');

      if (!show) return sendError(res, 404, 'Show not found.');

      // Active temporary holds
      const now = new Date();
      const activeHolds = show.temporaryHolds
        .filter(h => h.expiresAt > now)
        .map(h => ({ seatId: h.seatId, userId: h.userId, expiresAt: h.expiresAt }));

      return sendResponse(res, 200, true, 'Show details retrieved.', {
        show,
        activeHolds
      });
    } else {
      const show = memoryStore.shows.find(s => s._id.toString() === id.toString());
      if (!show) return sendError(res, 404, 'Show not found.');

      const movieObj = memoryStore.movies.find(m => m._id.toString() === (show.movie?._id || show.movie).toString());
      const theatreObj = memoryStore.theatres.find(t => t._id.toString() === (show.theatre?._id || show.theatre).toString());
      const screenObj = memoryStore.screens.find(sc => sc._id.toString() === (show.screen?._id || show.screen).toString());

      const now = new Date();
      const activeHolds = [];
      for (const [key, hold] of memoryStore.temporaryHolds.entries()) {
        const [sId, seatId] = key.split('_');
        if (sId === id.toString() && new Date(hold.expiresAt) > now) {
          activeHolds.push({ seatId, userId: hold.userId, expiresAt: hold.expiresAt });
        }
      }

      return sendResponse(res, 200, true, 'Show details retrieved.', {
        show: {
          ...show,
          movie: movieObj,
          theatre: theatreObj,
          screen: screenObj
        },
        activeHolds
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req, res, next) => {
  try {
    if (dbState.isConnected) {
      const show = await Show.create(req.body);
      return sendResponse(res, 201, true, 'Show created successfully.', show);
    } else {
      const newShow = {
        _id: 'shw_' + Date.now().toString(36),
        ...req.body,
        bookedSeats: [],
        temporaryHolds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.shows.push(newShow);
      return sendResponse(res, 201, true, 'Show created successfully.', newShow);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbState.isConnected) {
      await Show.findByIdAndDelete(id);
      return sendResponse(res, 200, true, 'Show deleted.');
    } else {
      const idx = memoryStore.shows.findIndex(s => s._id.toString() === id.toString());
      if (idx !== -1) memoryStore.shows.splice(idx, 1);
      return sendResponse(res, 200, true, 'Show deleted.');
    }
  } catch (error) {
    next(error);
  }
};
