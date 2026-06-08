import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env, telemetrySimEnabled } from './config/env.js';
import { logger } from './lib/logger.js';
import { startTelemetrySimulator } from './realtime/simulator.js';
import { initSocket } from './realtime/socket.js';

function main(): void {
  const app = createApp();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, apiPrefix: env.API_PREFIX },
      `escuchando en http://localhost:${env.PORT}`,
    );
    if (telemetrySimEnabled) {
      startTelemetrySimulator(env.TELEMETRY_SIM_INTERVAL_MS);
    }
  });
}

main();
