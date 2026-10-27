import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    if (dbState.isConnected) {
      const totalMovies = await Movie.countDocuments();
      const totalTheatres = await Theatre.countDocuments();
      const totalShows = await Show.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });

      // Revenue aggregation
      const revenueAgg = await Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$pricingSummary.totalAmount' } } }
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

      const recentBookings = await Booking.find()
        .populate('user', 'name email')
        .populate('movie', 'title')
        .populate('theatre', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      return sendResponse(res, 200, true, 'Admin statistics loaded.', {
        totalMovies,
        totalTheatres,
        totalShows,
        totalUsers,
        totalBookings,
        totalRevenue,
        recentBookings
      });
    } else {
      const confirmedBookings = memoryStore.bookings.filter(b => b.bookingStatus === 'confirmed');
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.pricingSummary?.totalAmount || 0), 0);

      const recentBookings = memoryStore.bookings.slice(0, 10);

      return sendResponse(res, 200, true, 'Admin statistics loaded.', {
        totalMovies: memoryStore.movies.length,
        totalTheatres: memoryStore.theatres.length,
        totalShows: memoryStore.shows.length,
        totalUsers: memoryStore.users.length,
        totalBookings: confirmedBookings.length,
        totalRevenue,
        recentBookings
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    if (dbState.isConnected) {
      const query = {};
      if (status && status !== 'All') query.bookingStatus = status;
      if (search) query.bookingReference = { $regex: search, $options: 'i' };

      const total = await Booking.countDocuments(query);
      const bookings = await Booking.find(query)
        .populate('user', 'name email')
        .populate('movie', 'title posterUrl')
        .populate('theatre', 'name city')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      return sendResponse(res, 200, true, 'All bookings retrieved.', bookings, {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      });
    } else {
      let filtered = [...memoryStore.bookings];
      if (status && status !== 'All') filtered = filtered.filter(b => b.bookingStatus === status);
      if (search) filtered = filtered.filter(b => b.bookingReference.toLowerCase().includes(search.toLowerCase()));

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const bookings = filtered.slice(skip, skip + Number(limit));

      return sendResponse(res, 200, true, 'All bookings retrieved.', bookings, {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    if (dbState.isConnected) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return sendResponse(res, 200, true, 'Users list retrieved.', users);
    } else {
      const users = memoryStore.users.map(({ password, ...u }) => u);
      return sendResponse(res, 200, true, 'Users list retrieved.', users);
    }
  } catch (error) {
    next(error);
  }
};
