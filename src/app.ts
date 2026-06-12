import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env, isTest } from './config/env.js';
import { logger } from './lib/logger.js';
import { apiRouter } from './routes.js';
import { openapiDocument } from './docs/openapi.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');

  app.get('/openapi.json', (_req: Request, res: Response) => {
    res.json(openapiDocument);
  });
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument as swaggerUi.JsonObject, { customSiteTitle: 'MetroFlota API' }),
  );

  app.use(helmet());

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  app.use(express.json());
  app.use(cookieParser(env.COOKIE_SECRET));

  if (!isTest) {
    app.use(
      pinoHttp({
        logger,
        customSuccessMessage: (req, res, responseTime) =>
          `${req.method} ${req.url} ${res.statusCode} ${Math.round(responseTime)}ms`,
        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} ${res.statusCode} ${err.message}`,
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        serializers: {
          req: () => undefined,
          res: () => undefined,
        },
      }),
    );
  }

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
