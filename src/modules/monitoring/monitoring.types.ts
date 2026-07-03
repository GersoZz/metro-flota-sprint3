// DTO de API de una unidad en un listado de monitoreo.
export interface MonitoringUnit {
  id: string;
  label: string;
}

// DTO de API de la telemetría de una unidad
export interface VehicleStatusDTO {
  unitId: string;
  speedKmh: number;
  driver: string | null;
  passengers: number;
  capacity: number;
  nextStop: string | null;
  routeCode: string | null;
  position: { lat: number; lng: number };
}
