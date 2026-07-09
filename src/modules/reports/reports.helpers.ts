import { AppError } from '../../lib/AppError.js';

// Funciones puras de los reportes: rangos de fecha y agrupacion de fallas.
// Viven aparte del servicio para poder probarlas sin abrir la base de datos.

export const round1 = (n: number): number => Math.round(n * 10) / 10;

// Rango [inicio, fin) de un dia en hora local del servidor.
// Si no se pasa fecha, se usa el dia de hoy.
export function dayRange(date?: string): { start: Date; end: Date } {
  const base = date ? new Date(`${date}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) {
    throw AppError.badRequest(`Fecha invalida: ${date}`);
  }
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
  return { start, end };
}

// Rango [inicio, fin) de un mes a partir de un string YYYY-MM.
// Si no se pasa mes, se usa el mes actual.
export function monthRange(month?: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  let year = now.getFullYear();
  let monthIndex = now.getMonth();
  if (month) {
    const parts = month.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      throw AppError.badRequest(`Mes invalido: ${month}`);
    }
    year = y;
    monthIndex = m - 1;
  }
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  const label = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return { start, end, label };
}

export interface RecurringFailureRow {
  failure: string;
  count: number;
}

// Agrupa una lista de textos y cuenta cuantas veces se repite cada uno,
// ignorando mayusculas y espacios. Devuelve el conteo ordenado de mayor a
// menor.
export function countFailures(values: (string | null)[]): RecurringFailureRow[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const raw of values) {
    if (!raw) continue;
    const label = raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const entry = counts.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      counts.set(key, { label, count: 1 });
    }
  }
  return [...counts.values()]
    .map((e) => ({ failure: e.label, count: e.count }))
    .sort((a, b) => b.count - a.count || a.failure.localeCompare(b.failure));
}

// Separa un campo de componentes en piezas individuales. El campo es texto
// libre separado por comas, asi que se parte por coma y se limpian espacios.
export function splitComponents(components: string | null): string[] {
  if (!components) return [];
  return components
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}
