import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import type { StopDTO } from '../routes/routes.service.js';
import type { CreateStopBody, UpdateStopBody } from './stops.schema.js';

type StopRow = { id: string; name: string; order: number; lat: unknown; lng: unknown };

function toStopDTO(s: StopRow): StopDTO {
  return {
    id: s.id,
    name: s.name,
    order: s.order,
    lat: s.lat != null ? Number(s.lat) : null,
    lng: s.lng != null ? Number(s.lng) : null,
  };
}

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

export async function createStop(routeCode: string, body: CreateStopBody): Promise<StopDTO> {
  return prisma.$transaction(async (tx) => {
    const route = await tx.route.findUnique({ where: { code: routeCode }, select: { code: true } });
    if (!route) throw AppError.notFound(`Ruta no encontrada: ${routeCode}`);

    const count = await tx.stop.count({ where: { routeCode } });
    const target = clamp(body.order ?? count + 1, 1, count + 1);

    const toShift = await tx.stop.findMany({
      where: { routeCode, order: { gte: target } },
      orderBy: { order: 'desc' },
    });
    for (const s of toShift) {
      await tx.stop.update({ where: { id: s.id }, data: { order: s.order + 1 } });
    }

    const created = await tx.stop.create({
      data: {
        routeCode,
        name: body.name,
        order: target,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
      },
    });
    return toStopDTO(created);
  });
}

export async function updateStop(id: string, body: UpdateStopBody): Promise<StopDTO> {
  return prisma.$transaction(async (tx) => {
    const stop = await tx.stop.findUnique({ where: { id } });
    if (!stop) throw AppError.notFound(`Parada no encontrada: ${id}`);

    const data: { name?: string; order?: number; lat?: number | null; lng?: number | null } = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.lat !== undefined) data.lat = body.lat;
    if (body.lng !== undefined) data.lng = body.lng;

    if (body.order !== undefined && body.order !== stop.order) {
      const count = await tx.stop.count({ where: { routeCode: stop.routeCode } });
      const target = clamp(body.order, 1, count);

      await tx.stop.update({ where: { id }, data: { order: 0 } });

      if (target < stop.order) {
        const rows = await tx.stop.findMany({
          where: { routeCode: stop.routeCode, order: { gte: target, lt: stop.order } },
          orderBy: { order: 'desc' },
        });
        for (const r of rows) {
          await tx.stop.update({ where: { id: r.id }, data: { order: r.order + 1 } });
        }
      } else {
        const rows = await tx.stop.findMany({
          where: { routeCode: stop.routeCode, order: { gt: stop.order, lte: target } },
          orderBy: { order: 'asc' },
        });
        for (const r of rows) {
          await tx.stop.update({ where: { id: r.id }, data: { order: r.order - 1 } });
        }
      }
      data.order = target;
    }

    const updated = await tx.stop.update({ where: { id }, data });
    return toStopDTO(updated);
  });
}

export async function deleteStop(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const stop = await tx.stop.findUnique({ where: { id } });
    if (!stop) throw AppError.notFound(`Parada no encontrada: ${id}`);

    await tx.stop.delete({ where: { id } });

    const rows = await tx.stop.findMany({
      where: { routeCode: stop.routeCode, order: { gt: stop.order } },
      orderBy: { order: 'asc' },
    });
    for (const r of rows) {
      await tx.stop.update({ where: { id: r.id }, data: { order: r.order - 1 } });
    }
  });
}
