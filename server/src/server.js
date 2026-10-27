import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, dbState } from './config/db.js';
import { setupSeatSocket } from './sockets/seatSocket.js';
import { memoryStore } from './services/memoryStore.js';
import { seedInitialData } from '../scripts/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);

// Socket.IO Real-time setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupSeatSocket(io);

// Start server
const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB();

    // Auto-seed sample movies and demo users so app is immediately populated
    await seedInitialData();

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🎬 IMOVIES BACKEND API SERVER RUNNING ON PORT ${PORT}`);
      console.log(`🔗 Local API URL: http://localhost:${PORT}`);
      console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
      console.log(`📡 Socket.IO Real-time Service Active`);
      console.log(`💾 Database Status: ${dbState.isConnected ? 'Connected to MongoDB Atlas / Local' : 'In-Memory Resilient Fallback'}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('Process terminated.');
  });
});
