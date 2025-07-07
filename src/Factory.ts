import logger from './loaders/Logger';
import { Server } from './loaders/Server';
logger.silly('Factory.ts');
import express from 'express';

export class Factory {
  static InitializeServer():Server {
    try {
      logger.info('index.InitializeServer');
      const app = express();
      return Server.getInstance(
        app,
      );
    } catch (error) {
      logger.error('Error occured in factory while initializing server '+error);
      throw error; // Re-throw the error instead of returning undefined
    }
}
}