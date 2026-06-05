import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

function main(): void {
  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, apiPrefix: env.API_PREFIX },
      `escuchando en http://localhost:${env.PORT}`,
    );
  });
}

main();
