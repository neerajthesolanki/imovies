import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'imovies_dev_secret_key_987654321_jwt', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (dbState.isConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return sendError(res, 400, 'An account with this email already exists.');
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone: phone || '',
        role: 'user'
      });

      const token = generateToken(user._id);

      return sendResponse(res, 201, true, 'Registration successful. Welcome to IMovies!', {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    } else {
      // Memory Store fallback
      const existingUser = memoryStore.users.find(u => u.email === normalizedEmail);
      if (existingUser) {
        return sendError(res, 400, 'An account with this email already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'usr_' + Date.now().toString(36),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryStore.users.push(newUser);
      const token = generateToken(newUser._id);

      return sendResponse(res, 201, true, 'Registration successful. Welcome to IMovies!', {
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide an email and password.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (dbState.isConnected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return sendError(res, 401, 'Invalid email or password.');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return sendError(res, 401, 'Invalid email or password.');
      }

      const token = generateToken(user._id);

      return sendResponse(res, 200, true, 'Login successful!', {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    } else {
      // Memory Store fallback
      const user = memoryStore.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return sendError(res, 401, 'Invalid email or password.');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendError(res, 401, 'Invalid email or password.');
      }

      const token = generateToken(user._id);

      return sendResponse(res, 200, true, 'Login successful!', {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'User profile fetched successfully.', {
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (dbState.isConnected) {
      const user = await User.findById(req.user._id);
      if (!user) return sendError(res, 404, 'User not found.');

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      await user.save();

      return sendResponse(res, 200, true, 'Profile updated successfully.', {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      if (!user) return sendError(res, 404, 'User not found.');

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      return sendResponse(res, 200, true, 'Profile updated successfully.', {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return sendResponse(res, 200, true, 'Logged out successfully.');
};
