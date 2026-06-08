import type { RequestHandler, Response } from 'express';
import { verifyAccessToken } from '../modules/auth/tokens.js';
import { AppError } from '../lib/AppError.js';

export function initSSE(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
}

export function sendEvent(res: Response, data: unknown, event?: string): void {
  if (event) res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export const authenticateSSE: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : typeof req.query.access_token === 'string'
      ? req.query.access_token
      : undefined;

  if (!token) {
    next(AppError.unauthorized('No autenticado'));
    return;
  }
  try {
    const { sub, role } = verifyAccessToken(token);
    req.user = { id: sub, role };
    next();
  } catch {
    next(AppError.unauthorized('Token inválido o expirado'));
  }
};
