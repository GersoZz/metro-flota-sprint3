import { prisma } from '../../lib/prisma.js';
import {
  countFailures,
  dayRange,
  monthRange,
  round1,
  splitComponents,
  type RecurringFailureRow,
} from './reports.helpers.js';
import type {
  DailyReportQuery,
  MonthlyReportQuery,
  RecurringFailuresQuery,
} from './reports.schema.js';

// Cumplimiento promedio de frecuencia: buses operativos en cada ruta sobre
// los buses asignados a esa ruta. Es el mismo criterio del dashboard.
async function averageCompliance(): Promise<number> {
  const routes = await prisma.route.findMany();
  if (!routes.length) return 0;
  const values = await Promise.all(
    routes.map(async (r) => {
      const running = await prisma.vehicle.count({
        where: { currentRouteCode: r.code, state: 'Operativo' },
      });
      const required = r.busesAssigned > 0 ? r.busesAssigned : running;
      return required > 0 ? Math.min(100, (running / required) * 100) : 0;
    }),
  );
  return round1(values.reduce((a, v) => a + v, 0) / values.length);
}

// -------------------- RF-22: reporte diario de operacion --------------------

export interface DailyReportDTO {
  date: string;
  busesDispatched: number;
  fleetTotal: number;
  frequencyCompliance: number;
  alertsCount: number;
  fleetKm: number;
}

export async function getDailyReport(query: DailyReportQuery): Promise<DailyReportDTO> {
  const { start, end } = dayRange(query.date);

  const [busesDispatched, fleetTotal, alertsCount, kmAgg, compliance] = await Promise.all([
    prisma.vehicle.count({ where: { state: 'Operativo' } }),
    prisma.vehicle.count(),
    prisma.alert.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.vehicle.aggregate({ _sum: { km: true } }),
    averageCompliance(),
  ]);

  return {
    date: start.toISOString().slice(0, 10),
    busesDispatched,
    fleetTotal,
    frequencyCompliance: compliance,
    alertsCount,
    fleetKm: kmAgg._sum.km ?? 0,
  };
}

// ----------------- RF-23: reporte mensual de mantenimiento ------------------

export interface MonthlyConsortiumRow {
  consortiumId: string;
  consortiumName: string;
  maintenanceCount: number;
  totalCost: number;
  vehicles: number;
  vehiclesOperational: number;
  availability: number;
}

export interface MonthlyReportDTO {
  month: string;
  totalMaintenance: number;
  totalCost: number;
  byConsortium: MonthlyConsortiumRow[];
}

export async function getMonthlyReport(query: MonthlyReportQuery): Promise<MonthlyReportDTO> {
  const { start, end, label } = monthRange(query.month);

  // Mantenimientos del mes: se filtran por fecha de ejecucion y, si no la
  // tienen, por fecha programada. Se incluye el consorcio del vehiculo para
  // poder agrupar por consorcio.
  const maintenances = await prisma.maintenance.findMany({
    where: {
      OR: [
        { executedDate: { gte: start, lt: end } },
        { AND: [{ executedDate: null }, { scheduledDate: { gte: start, lt: end } }] },
      ],
    },
    include: { vehicle: { include: { consortium: true } } },
  });

  // Estado actual de la flota por consorcio para estimar la disponibilidad.
  const vehicles = await prisma.vehicle.findMany({
    include: { consortium: true },
  });

  interface Bucket {
    consortiumId: string;
    consortiumName: string;
    maintenanceCount: number;
    totalCost: number;
    vehicles: number;
    vehiclesOperational: number;
  }
  const buckets = new Map<string, Bucket>();

  const ensure = (id: string, name: string): Bucket => {
    let bucket = buckets.get(id);
    if (!bucket) {
      bucket = {
        consortiumId: id,
        consortiumName: name,
        maintenanceCount: 0,
        totalCost: 0,
        vehicles: 0,
        vehiclesOperational: 0,
      };
      buckets.set(id, bucket);
    }
    return bucket;
  };

  for (const v of vehicles) {
    const bucket = ensure(v.consortiumId, v.consortium.name);
    bucket.vehicles += 1;
    if (v.state === 'Operativo') bucket.vehiclesOperational += 1;
  }

  let totalCost = 0;
  for (const m of maintenances) {
    const bucket = ensure(m.vehicle.consortiumId, m.vehicle.consortium.name);
    bucket.maintenanceCount += 1;
    const cost = m.costEstimate ? Number(m.costEstimate) : 0;
    bucket.totalCost += cost;
    totalCost += cost;
  }

  const byConsortium: MonthlyConsortiumRow[] = [...buckets.values()]
    .map((b) => ({
      consortiumId: b.consortiumId,
      consortiumName: b.consortiumName,
      maintenanceCount: b.maintenanceCount,
      totalCost: round1(b.totalCost),
      vehicles: b.vehicles,
      vehiclesOperational: b.vehiclesOperational,
      availability: b.vehicles > 0 ? round1((b.vehiclesOperational / b.vehicles) * 100) : 0,
    }))
    .sort((a, b) => a.consortiumName.localeCompare(b.consortiumName));

  return {
    month: label,
    totalMaintenance: maintenances.length,
    totalCost: round1(totalCost),
    byConsortium,
  };
}

// ------------------- RF-21: reporte de fallas recurrentes -------------------

export interface RecurringFailuresDTO {
  byDescription: RecurringFailureRow[];
  byComponent: RecurringFailureRow[];
}

export async function getRecurringFailures(
  _query: RecurringFailuresQuery,
): Promise<RecurringFailuresDTO> {
  // Solo se consideran los mantenimientos correctivos, que son los que
  // corresponden a una falla real (RF-21).
  const rows = await prisma.maintenance.findMany({
    where: { type: 'Correctivo' },
    select: { description: true, components: true },
  });

  const componentValues: (string | null)[] = [];
  for (const r of rows) {
    for (const piece of splitComponents(r.components)) {
      componentValues.push(piece);
    }
  }

  return {
    byDescription: countFailures(rows.map((r) => r.description)),
    byComponent: countFailures(componentValues),
  };
}
