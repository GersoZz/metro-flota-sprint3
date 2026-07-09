// Reglas de umbral del RF-18, sin acceso a base de datos para poder probarlas solas.
// Se avisa cuando el vehiculo esta a 5000 km o 7 dias de un mantenimiento programado.

const KM_THRESHOLD = 5000;
const DAYS_THRESHOLD = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Revisa si un mantenimiento programado esta cerca por kilometraje.
export function nearByKm(vehicleKm: number, thresholdKm: number | null): boolean {
  if (thresholdKm === null) return false;
  const remaining = thresholdKm - vehicleKm;
  return remaining >= 0 && remaining <= KM_THRESHOLD;
}

// Revisa si un mantenimiento programado esta cerca por fecha.
export function nearByDate(scheduledDate: Date | null, now: Date): boolean {
  if (scheduledDate === null) return false;
  const days = (scheduledDate.getTime() - now.getTime()) / MS_PER_DAY;
  return days >= 0 && days <= DAYS_THRESHOLD;
}
