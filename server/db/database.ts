/**
 * MongoDB connection management via Mongoose
 */

import mongoose from 'mongoose';

let connected = false;

export async function connectDatabase(): Promise<void> {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  connected = true;
  console.log('✅ MongoDB connected:', mongoose.connection.host);

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    connected = false;
    console.warn('MongoDB disconnected');
  });
}

export async function closeDatabase(): Promise<void> {
  if (connected) {
    await mongoose.disconnect();
    connected = false;
  }
}
