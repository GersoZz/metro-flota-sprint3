import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import {
  routeTypeToDisplay,
  vehicleStateToDisplay,
  vehicleTypeToDisplay,
} from '../../lib/domainEnums.js';
import { allowedRouteTypes, isCompatible } from './compatibility.js';
import type { AssignBody } from './assignment.schema.js';

// Un vehiculo EnTaller o DadoDeBaja no puede operar una ruta (RF-09).
function isAssignableState(state: string): boolean {
  return state !== 'EnTaller' && state !== 'DadoDeBaja';
}

export interface AssignmentDTO {
  vehicleId: string;
  routeCode: string;
  vehicleType: string;
  routeType: string;
}

// Asigna un vehiculo a una ruta validando compatibilidad y estado (RF-08).
// Reglas: el tipo de bus debe ser compatible con el tipo de ruta, el vehiculo
// no puede estar EnTaller ni DadoDeBaja, y no puede quedar en dos rutas a la vez.
export async function assignVehicleToRoute(body: AssignBody): Promise<AssignmentDTO> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: body.vehicleId },
    select: { id: true, type: true, state: true, currentRouteCode: true },
  });
  if (!vehicle) throw AppError.notFound(`Unidad no encontrada: ${body.vehicleId}`);

  const route = await prisma.route.findUnique({
    where: { code: body.routeCode },
    select: { code: true, type: true },
  });
  if (!route) throw AppError.notFound(`Ruta no encontrada: ${body.routeCode}`);

  if (!isAssignableState(vehicle.state)) {
    throw AppError.badRequest(
      `La unidad ${vehicle.id} esta ${vehicleStateToDisplay[vehicle.state]} y no puede asignarse a una ruta`,
    );
  }

  if (!isCompatible(vehicle.type, route.type)) {
    const permitidos = allowedRouteTypes(vehicle.type)
      .map((t) => routeTypeToDisplay[t])
      .join(', ');
    throw AppError.badRequest(
      `Tipo incompatible: un ${vehicleTypeToDisplay[vehicle.type]} solo opera en rutas ${permitidos}`,
    );
  }

  // Un bus no puede estar asignado a dos rutas activas a la vez (RF-09).
  if (vehicle.currentRouteCode !== null && vehicle.currentRouteCode !== route.code) {
    throw AppError.conflict(
      `La unidad ${vehicle.id} ya esta asignada a la ruta ${vehicle.currentRouteCode}`,
    );
  }

  // Si ya estaba en esta misma ruta no se recalculan contadores.
  if (vehicle.currentRouteCode === route.code) {
    return {
      vehicleId: vehicle.id,
      routeCode: route.code,
      vehicleType: vehicleTypeToDisplay[vehicle.type],
      routeType: routeTypeToDisplay[route.type],
    };
  }

  await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { currentRouteCode: route.code },
    }),
    prisma.route.update({
      where: { code: route.code },
      data: { busesAssigned: { increment: 1 } },
    }),
  ]);

  return {
    vehicleId: vehicle.id,
    routeCode: route.code,
    vehicleType: vehicleTypeToDisplay[vehicle.type],
    routeType: routeTypeToDisplay[route.type],
  };
}

export interface ConflictDTO {
  vehicleId: string;
  routeCode: string;
  reason: string;
}

// Detecta conflictos de asignacion en toda la flota (RF-09):
// - vehiculo asignado a una ruta con tipo incompatible
// - vehiculo EnTaller o DadoDeBaja que sigue asignado a una ruta
export async function detectConflicts(): Promise<ConflictDTO[]> {
  const assigned = await prisma.vehicle.findMany({
    where: { currentRouteCode: { not: null } },
    select: {
      id: true,
      type: true,
      state: true,
      currentRouteCode: true,
      currentRoute: { select: { type: true } },
    },
    orderBy: { id: 'asc' },
  });

  const conflicts: ConflictDTO[] = [];

  for (const v of assigned) {
    const routeCode = v.currentRouteCode as string;

    if (!isAssignableState(v.state)) {
      conflicts.push({
        vehicleId: v.id,
        routeCode,
        reason: `Unidad ${vehicleStateToDisplay[v.state]} sigue asignada a la ruta`,
      });
      continue;
    }

    if (v.currentRoute && !isCompatible(v.type, v.currentRoute.type)) {
      conflicts.push({
        vehicleId: v.id,
        routeCode,
        reason: `Tipo incompatible: ${vehicleTypeToDisplay[v.type]} en ruta ${routeTypeToDisplay[v.currentRoute.type]}`,
      });
    }
  }

  return conflicts;
}
