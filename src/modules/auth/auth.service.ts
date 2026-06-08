import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { verifyPassword } from './password.js';
import { signAccessToken, signRefreshToken } from './tokens.js';

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
