/**
 * Database configuration and connection
 */

import mongoose from 'mongoose';

export interface DatabaseConfig {
  mongoUri: string;
  dbName?: string;
}

/**
 * Connect to MongoDB
 */
export async function connectToMongoDB(config?: DatabaseConfig): Promise<void> {
  const mongoUri = config?.mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/titoproof';

  try {
    await mongoose.connect(mongoUri, {
      dbName: config?.dbName || process.env.DB_NAME || 'titoproof',
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
}

/**
 * Get MongoDB connection status
 */
export function getConnectionStatus(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});
