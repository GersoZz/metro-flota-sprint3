import type { VehicleType, RouteType } from '../../generated/prisma/client.js';

// Reglas de compatibilidad tipo de bus <-> tipo de ruta (RF-08).
// Un bus articulado solo opera en rutas troncales o expresas.
// Un alimentador solo opera en rutas alimentadoras.
const COMPATIBILITY: Record<VehicleType, RouteType[]> = {
  BusArticulado: ['Troncal', 'Expreso'],
  Alimentador: ['Alimentador'],
};

// Indica si un vehiculo de cierto tipo puede asignarse a una ruta de cierto tipo.
export function isCompatible(vehicleType: VehicleType, routeType: RouteType): boolean {
  return COMPATIBILITY[vehicleType].includes(routeType);
}

// Devuelve los tipos de ruta permitidos para un tipo de vehiculo.
// Sirve para armar mensajes de error mas claros.
export function allowedRouteTypes(vehicleType: VehicleType): RouteType[] {
  return COMPATIBILITY[vehicleType];
}
