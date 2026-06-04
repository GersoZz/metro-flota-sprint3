import { createApp } from './app.js';
import { env } from './config/env.js';

function main(): void {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(
      `Escuchando en http://localhost:${env.PORT}` +
        `  (NODE_ENV=${env.NODE_ENV}, API_PREFIX=${env.API_PREFIX})`,
    );
  });
}

main();
