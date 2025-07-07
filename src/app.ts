import logger from './loaders/Logger';
logger.silly('app.ts');
import { Factory } from './Factory';
logger.silly('app.ts');

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logger.error('Uncaught Exception: ' + error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection: ' + reason);
  process.exit(1);
});

async function startServer() {
  try {

    logger.info('Init');

    const server = Factory.InitializeServer();

    if (!server) {
      logger.error('Failed to initialize server');
      process.exit(1);
    }

    server.start();
  } catch (error) {
    logger.error('Error occured in app file :'+ error);
    process.exit(1);
  }

}

startServer();