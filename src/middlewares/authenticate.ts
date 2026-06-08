import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/tokens.js';
import { AppError } from '../lib/AppError.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized('No autenticado'));
    return;
  }
  try {
    const { sub, role } = verifyAccessToken(header.slice(7));
    req.user = { id: sub, role };
    next();
  } catch {
    next(AppError.unauthorized('Token inválido o expirado'));
  }
};
