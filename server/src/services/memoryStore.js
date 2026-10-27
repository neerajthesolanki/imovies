// In-memory persistent data store fallback for when MongoDB Atlas is offline or not configured
import bcrypt from 'bcryptjs';

export const memoryStore = {
  users: [],
  movies: [],
  theatres: [],
  screens: [],
  shows: [],
  bookings: [],
  payments: [],
  notifications: [],
  temporaryHolds: new Map(), // key: showId_seatId -> { userId, expiresAt, holdToken }

  initDefaults: async function () {
    if (this.users.length > 0) return; // already initialized

    const hashedAdminPassword = await bcrypt.hash('Admin@123456', 10);
    const hashedUserPassword = await bcrypt.hash('User@123456', 10);

    const adminUser = {
      _id: '65e000000000000000000001',
      name: 'IMovies Administrator',
      email: 'admin@imovies.com',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+91 9876543210',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const demoUser = {
      _id: '65e000000000000000000002',
      name: 'Demo Moviegoer',
      email: 'user@imovies.com',
      password: hashedUserPassword,
      role: 'user',
      phone: '+91 9876500000',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(adminUser, demoUser);
  }
};
