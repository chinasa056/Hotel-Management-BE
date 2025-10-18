import mongoose from 'mongoose';
import { logger } from '../utils/logger';
const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const dbConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(connectionString);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default dbConnection;
