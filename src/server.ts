import { env } from './config/env.js';

function main(): void {
  console.log(
    `Envs (NODE_ENV=${env.NODE_ENV}, PORT=${env.PORT}, API_PREFIX=${env.API_PREFIX})`,
  );
}

main();
