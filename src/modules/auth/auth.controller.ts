import type { Request, Response } from 'express';
import { login } from './auth.service.js';
import { clearRefreshCookie, setRefreshCookie } from './auth.cookie.js';
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
