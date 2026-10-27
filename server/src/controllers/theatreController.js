import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const listTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;

    if (dbState.isConnected) {
      const query = { isActive: true };
      if (city) query.city = { $regex: city, $options: 'i' };
      if (search) query.name = { $regex: search, $options: 'i' };

      const theatres = await Theatre.find(query).sort({ name: 1 });
      return sendResponse(res, 200, true, 'Theatres fetched successfully.', theatres);
    } else {
      let filtered = memoryStore.theatres.filter(t => t.isActive !== false);
      if (city) filtered = filtered.filter(t => t.city.toLowerCase().includes(city.toLowerCase()));
      if (search) filtered = filtered.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

      return sendResponse(res, 200, true, 'Theatres fetched successfully.', filtered);
    }
  } catch (error) {
    next(error);
  }
};

export const getTheatreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (dbState.isConnected) {
      const theatre = await Theatre.findById(id);
      if (!theatre) return sendError(res, 404, 'Theatre not found.');

      const screens = await Screen.find({ theatre: id });
      return sendResponse(res, 200, true, 'Theatre retrieved.', { theatre, screens });
    } else {
      const theatre = memoryStore.theatres.find(t => t._id.toString() === id.toString());
      if (!theatre) return sendError(res, 404, 'Theatre not found.');

      const screens = memoryStore.screens.filter(s => s.theatre?.toString() === id.toString());
      return sendResponse(res, 200, true, 'Theatre retrieved.', { theatre, screens });
    }
  } catch (error) {
    next(error);
  }
};

export const createTheatre = async (req, res, next) => {
  try {
    if (dbState.isConnected) {
      const theatre = await Theatre.create(req.body);
      return sendResponse(res, 201, true, 'Theatre created successfully.', theatre);
    } else {
      const newTheatre = {
        _id: 'th_' + Date.now().toString(36),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.theatres.push(newTheatre);
      return sendResponse(res, 201, true, 'Theatre created successfully.', newTheatre);
    }
  } catch (error) {
    next(error);
  }
};

export const updateTheatre = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbState.isConnected) {
      const theatre = await Theatre.findByIdAndUpdate(id, req.body, { new: true });
      if (!theatre) return sendError(res, 404, 'Theatre not found.');
      return sendResponse(res, 200, true, 'Theatre updated.', theatre);
    } else {
      const idx = memoryStore.theatres.findIndex(t => t._id.toString() === id.toString());
      if (idx === -1) return sendError(res, 404, 'Theatre not found.');
      memoryStore.theatres[idx] = { ...memoryStore.theatres[idx], ...req.body, updatedAt: new Date() };
      return sendResponse(res, 200, true, 'Theatre updated.', memoryStore.theatres[idx]);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteTheatre = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbState.isConnected) {
      await Theatre.findByIdAndDelete(id);
      return sendResponse(res, 200, true, 'Theatre deleted.');
    } else {
      const idx = memoryStore.theatres.findIndex(t => t._id.toString() === id.toString());
      if (idx !== -1) memoryStore.theatres.splice(idx, 1);
      return sendResponse(res, 200, true, 'Theatre deleted.');
    }
  } catch (error) {
    next(error);
  }
};
