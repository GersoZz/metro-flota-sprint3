import type { Response } from 'express';
import { env, isProduction } from '../../config/env.js';

export const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_PATH = `${env.API_PREFIX}/auth`;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // alinear con JWT_REFRESH_TTL

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: REFRESH_COOKIE_PATH,
};

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, { ...baseOptions, maxAge: REFRESH_MAX_AGE_MS });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, baseOptions);
}
