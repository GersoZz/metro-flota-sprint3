import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { verifyPassword } from './password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './tokens.js';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

type UserRow = { id: string; name: string; email: string; role: string };

export function toUserDTO(u: UserRow): UserDTO {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

export interface LoginResult {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  const invalid = AppError.unauthorized('Credenciales inválidas');
  if (!user) throw invalid;
  if (!(await verifyPassword(user.passwordHash, password))) throw invalid;

  const tokenUser = { id: user.id, role: user.role };
  return {
    user: toUserDTO(user),
    accessToken: signAccessToken(tokenUser),
    refreshToken: signRefreshToken(tokenUser),
  };
}

export async function refresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  let sub: string;
  try {
    sub = verifyRefreshToken(refreshToken).sub;
  } catch {
    throw AppError.unauthorized('Refresh token inválido o expirado');
  }
  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user) throw AppError.unauthorized('Refresh token inválido o expirado');

  const tokenUser = { id: user.id, role: user.role };
  return { accessToken: signAccessToken(tokenUser), refreshToken: signRefreshToken(tokenUser) };
}

export async function getMe(userId: string): Promise<UserDTO> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.unauthorized('No autenticado');
  return toUserDTO(user);
}
