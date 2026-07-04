import type { RequestHandler } from 'express';
import { prisma } from '../lib/prisma.js';

// Traduce el metodo HTTP a la accion que guardamos en el log (RF-29).
const methodToAction: Record<string, string> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};

// Saca el nombre de la entidad del path. Toma el primer segmento
// Devuelve el indice donde empieza el recurso, saltando "api" y el
// segmento de version si existe (ej v1). Ej: /api/v1/vehicles -> indice de "vehicles".
function resourceStart(segments: string[]): number {
  const apiIndex = segments.indexOf('api');
  let start = apiIndex >= 0 ? apiIndex + 1 : 0;
  // Salta el segmento de version tipo v1, v2, etc.
  if (segments[start] && /^v\d+$/.test(segments[start]!)) start += 1;
  return start;
}

// Saca el recurso del path. Ej: /api/v1/vehicles/123 -> "vehicles".
function entityFromPath(originalUrl: string): string {
  const pathOnly = originalUrl.split('?')[0] ?? '';
  const segments = pathOnly.split('/').filter((s) => s.length > 0);
  return segments[resourceStart(segments)] ?? 'unknown';
}

// Saca el id de la entidad si viene despues del recurso.
// Ej: /api/v1/vehicles/123 -> "123". Si no hay, devuelve null.
function entityIdFromPath(originalUrl: string): string | null {
  const pathOnly = originalUrl.split('?')[0] ?? '';
  const segments = pathOnly.split('/').filter((s) => s.length > 0);
  return segments[resourceStart(segments) + 1] ?? null;
}

// Middleware que registra las mutaciones (crear, actualizar, borrar) hechas
// por un usuario autenticado. Se engancha a res.on('finish') para guardar
// solo cuando la respuesta salio bien (status < 400). El insert es
// fire-and-forget: si falla no rompe la respuesta al cliente.
// Debe montarse DESPUES de authenticate para tener req.user disponible.
export const auditLog: RequestHandler = (req, res, next) => {
  const action = methodToAction[req.method];
  if (!action) {
    next();
    return;
  }

  res.on('finish', () => {
    if (res.statusCode >= 400) return;

    const entity = entityFromPath(req.originalUrl);
    const entityId = entityIdFromPath(req.originalUrl);
    const detail = `${req.method} ${req.originalUrl.split('?')[0]}`;

    void prisma.auditLog
      .create({
        data: {
          action,
          entity,
          entityId,
          detail,
          userId: req.user?.id ?? null,
        },
      })
      .catch(() => {
        // No propagamos el error para no afectar la respuesta ya enviada.
      });
  });

  next();
};
