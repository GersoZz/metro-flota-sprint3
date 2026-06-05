export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static notFound(message = 'Recurso no encontrado', details?: unknown): AppError {
    return new AppError(404, 'NOT_FOUND', message, details);
  }

  static badRequest(message = 'Solicitud inválida', details?: unknown): AppError {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'No autenticado', details?: unknown): AppError {
    return new AppError(401, 'UNAUTHORIZED', message, details);
  }

  static forbidden(message = 'No autorizado', details?: unknown): AppError {
    return new AppError(403, 'FORBIDDEN', message, details);
  }

  static conflict(message = 'Conflicto', details?: unknown): AppError {
    return new AppError(409, 'CONFLICT', message, details);
  }
}
