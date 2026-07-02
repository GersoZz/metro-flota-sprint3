import { pino, type Logger as PinoLogger } from 'pino';
import { env, isProduction, isTest } from '../config/env.js';

// Rol Singleton: garantiza una única instancia del logger pino 
// y ofrece un punto de acceso global vía AppLogger.get()
// El constructor privado impide crear loggers sueltos por error.
export class AppLogger {
  private static instance: AppLogger | undefined;

  public readonly pino: PinoLogger;
  
  // Constructor protegido por el singleton
  private constructor() {
    this.pino = pino({
      level: isTest ? 'silent' : (process.env.LOG_LEVEL ?? 'info'),
      ...(isProduction
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
            },
          }),
      base: { env: env.NODE_ENV },
    });
  }

  // Punto de acceso global: crea la instancia la primera vez y la reutiliza siempre.
  public static get(): AppLogger {
    return (AppLogger.instance ??= new AppLogger());
  }
}
