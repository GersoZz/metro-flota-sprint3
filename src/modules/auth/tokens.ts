import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface TokenUser {
  id: string;
  role: string;
}

export interface AccessClaims {
  sub: string;
  role: string;
}

function secret(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} no configurado: requerido para la autenticación.`);
  return value;
}

const accessSecret = (): string => secret(env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET');
const refreshSecret = (): string => secret(env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');

const accessTtl = env.JWT_ACCESS_TTL as SignOptions['expiresIn'];
const refreshTtl = env.JWT_REFRESH_TTL as SignOptions['expiresIn'];

export function signAccessToken(user: TokenUser): string {
  return jwt.sign({ role: user.role }, accessSecret(), { subject: user.id, expiresIn: accessTtl });
}

export function signRefreshToken(user: TokenUser): string {
  return jwt.sign({}, refreshSecret(), { subject: user.id, expiresIn: refreshTtl });
}

export function verifyAccessToken(token: string): AccessClaims {
  const payload = jwt.verify(token, accessSecret()) as jwt.JwtPayload;
  return { sub: String(payload.sub), role: String(payload.role) };
}

export function verifyRefreshToken(token: string): { sub: string } {
  const payload = jwt.verify(token, refreshSecret()) as jwt.JwtPayload;
  return { sub: String(payload.sub) };
}
