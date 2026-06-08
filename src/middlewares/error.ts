import type { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';
import { logger } from '../lib/logger.js';
import { isProduction } from '../config/env.js';
import { Prisma } from '../generated/prisma/client.js';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const notFoundHandler: RequestHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  } satisfies ErrorBody);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res: Response, _next) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: err.issues,
      },
    } satisfies ErrorBody);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    } satisfies ErrorBody);
    return;
  }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' },
      } satisfies ErrorBody);
      return;
    }
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ');
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: target ? `Valor duplicado en: ${target}` : 'Valor duplicado',
        },
      } satisfies ErrorBody);
      return;
    }
  }

  logger.error({ err }, 'Error no controlado');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction
        ? 'Error interno del servidor'
        : err instanceof Error
          ? err.message
          : 'Error interno del servidor',
    },
  } satisfies ErrorBody);
};
