import { describe, expect, it } from 'vitest';
import { Database } from '../src/lib/Database.js';
import { AppLogger } from '../src/lib/AppLogger.js';
import { TelemetryBus } from '../src/realtime/TelemetryBus.js';
import { prisma } from '../src/lib/prisma.js';
import { logger } from '../src/lib/logger.js';

describe('Singleton', () => {
  it('Database.get() devuelve siempre la misma instancia', () => {
    expect(Database.get()).toBe(Database.get());
  });

  it('AppLogger.get() devuelve siempre la misma instancia', () => {
    expect(AppLogger.get()).toBe(AppLogger.get());
  });

  it('TelemetryBus.get() devuelve siempre la misma instancia', () => {
    expect(TelemetryBus.get()).toBe(TelemetryBus.get());
  });

  it('`prisma` es el client del Singleton Database', () => {
    expect(prisma).toBe(Database.get().client);
  });

  it('`logger` es el pino del Singleton AppLogger', () => {
    expect(logger).toBe(AppLogger.get().pino);
  });
});
