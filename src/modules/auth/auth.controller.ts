import type { Request, Response } from 'express';
import { getMe, login, refresh } from './auth.service.js';
import { clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from './auth.cookie.js';
import { verifyAccessToken } from './tokens.js';
import { AppError } from '../../lib/AppError.js';
import type { LoginBody } from './auth.schema.js';

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.valid!.body as LoginBody;
  const { user, accessToken, refreshToken } = await login(email, password);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export function logoutHandler(_req: Request, res: Response): void {
  clearRefreshCookie(res);
  res.status(204).end();
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const token = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
  if (!token) throw AppError.unauthorized('No hay refresh token');
  const { accessToken, refreshToken } = await refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw AppError.unauthorized('No autenticado');
  let sub: string;
  try {
    sub = verifyAccessToken(header.slice(7)).sub;
  } catch {
    throw AppError.unauthorized('Token inválido o expirado');
  }
  res.json(await getMe(sub));
}
