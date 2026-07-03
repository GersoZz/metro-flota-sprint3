import type { Logger as PinoLogger } from 'pino';
import { AppLogger } from './AppLogger.js';

export const logger: PinoLogger = AppLogger.get().pino;
