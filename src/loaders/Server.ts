import logger from './Logger';
import { Express, Request, Response, NextFunction } from 'express';
logger.silly("S1");
import express from 'express';
logger.silly("S2");
import routes from '../api';
logger.silly("S3");
import config from '../config';
logger.silly("S4");
import cors from 'cors';
import { NotFoundError, ApiError, InternalError } from '../core/APIerror';

export class Server {
  static instance: Server;

  static getInstance(
    app: Express,
  ) {
    if (Server.instance === undefined || Server.instance === null) {
      Server.instance = new Server(
        app,
      );
    }
    return Server.instance;
  }

  private constructor(
    public app: Express,
  ) { }

  async start() {
    try {
      const corsOptions = {
        origin: '*',
      }
      this.app.use(cors(corsOptions));
      this.app.options('*', cors());

      this.app.use(express.json());

      this.app.use(express.urlencoded({
        extended: true
      }));

      // Logging middleware for all requests (including frontend)
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const referer = req.get('Referer') || 'Direct';
        
        logger.info(`Request: ${req.method} ${req.originalUrl} | IP: ${clientIP} | User-Agent: ${userAgent} | Referer: ${referer} | Time: ${new Date().toISOString()}`);
        next();
      });

      this.app.use(config.api.prefix,routes());
      logger.info('Routes initialize.');

      // 404 handler - must come after routes
      this.app.use('*', (req, res, next) => next(new NotFoundError()));

      // Error handling middleware - must come last
      this.app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
        if (err instanceof ApiError) {
          ApiError.handle(err, res);
        } else {
          if (process.env.NODE_ENV === 'development') {
            logger.error(err);
            res.status(500).send(err.message);
            return;
          }
          logger.error(err);
          ApiError.handle(new InternalError('internal error...'), res);
        }
      });

      this.app.listen(config.port, () => {
        logger.info('******Server listening on PORT: ' + config.port + '******');
      });
    } catch (error) {
      logger.error('Server error occured in server.start ' + error);
      logger.error((error as Error).stack);
    }
  }
}