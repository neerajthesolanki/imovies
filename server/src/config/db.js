import mongoose from 'mongoose';

export const dbState = {
  isConnected: false,
  isFallback: false,
  uri: ''
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
  dbState.uri = uri;

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    dbState.isConnected = true;
    dbState.isFallback = false;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`\n[Database Warning] Could not connect to MongoDB at "${uri}".`);
    console.warn(`Reason: ${err.message}`);
    console.warn(`[Database Fallback] Operating in resilient memory mode. Provide a valid MongoDB Atlas URI in server/.env to use persistent cloud storage.\n`);
    dbState.isConnected = false;
    dbState.isFallback = true;
    return null;
  }
};
