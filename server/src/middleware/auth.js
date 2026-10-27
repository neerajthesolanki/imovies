import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required. Please log in to continue.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'imovies_dev_secret_key_987654321_jwt');

    let user;
    if (dbState.isConnected) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.users.find(u => u._id.toString() === decoded.id.toString());
      if (user) {
        const { password, ...safeUser } = user;
        user = safeUser;
      }
    }

    if (!user) {
      return sendError(res, 401, 'Session invalid or user account no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired session token. Please log in again.');
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Forbidden: Administrator privileges required for this action.');
  }
  next();
};
