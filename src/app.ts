import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { env, isTest } from './config/env.js';
import { logger } from './lib/logger.js';
import { apiRouter } from './routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  app.use(express.json());
  app.use(cookieParser(env.COOKIE_SECRET));

  if (!isTest) {
    app.use(pinoHttp({ logger }));
  }

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
