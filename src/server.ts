import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import dbConnection from './config/database';
import { logger } from './utils/logger';
import ConfigService from './services/ConfigService';

const startServer = async (): Promise<void> => {
  await dbConnection();
await ConfigService.loadAllConfigs()
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    logger.info(`
              🚀 App listening on port ${port}
    `);
  });
};

startServer();
