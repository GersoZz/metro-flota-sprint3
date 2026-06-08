import type { RequestHandler } from 'express';
import { AppError } from '../lib/AppError.js';

export function requireRole(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthorized('No autenticado'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden('No tienes permiso para esta acción'));
      return;
    }
    next();
  };
}
