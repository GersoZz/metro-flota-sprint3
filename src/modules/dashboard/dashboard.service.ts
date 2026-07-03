import { prisma } from '../../lib/prisma.js';
import type { AvailabilityQuery, DashboardAlertsQuery } from './dashboard.schema.js';

const round1 = (n: number): number => Math.round(n * 10) / 10;

export interface Kpi {
  title: string;
  value: number;
  delta?: string;
  subtitle?: string;
  accent: string;
}

export async function getKpis(): Promise<Kpi[]> {
  const [total, operativo, enTaller, activeAlerts, dangerAlerts] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { state: 'Operativo' } }),
    prisma.vehicle.count({ where: { state: 'EnTaller' } }),
    prisma.alert.count({ where: { acknowledgedAt: null } }),
    prisma.alert.count({ where: { acknowledgedAt: null, tone: 'danger' } }),
  ]);

  const pctService = total ? round1((operativo / total) * 100) : 0;
  const availability = total ? round1(((total - enTaller) / total) * 100) : 0;

  const compliance = await getRouteCompliance();
  const avgCompliance = compliance.length
    ? round1(compliance.reduce((a, c) => a + c.value, 0) / compliance.length)
    : 0;

  return [
    { title: 'Buses en servicio', value: operativo, subtitle: `${pctService}% de la flota total`, accent: 'blue' },
    { title: 'Disponibilidad flota', value: availability, subtitle: 'Operativa vs. mantenimiento', accent: 'green' },
    { title: 'Cumplimiento frecuencia', value: avgCompliance, subtitle: 'Promedio por ruta', accent: 'indigo' },
    { title: 'Alertas activas', value: activeAlerts, delta: `${dangerAlerts} críticas`, accent: 'red' },
  ];
}

export interface AvailabilityPoint {
  day: string;
  operativa: number;
  mantenimiento: number;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_WEEKS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

export async function getAvailability(query: AvailabilityQuery): Promise<AvailabilityPoint[]> {
  const labels = query.range === 'month' ? MONTH_WEEKS : WEEK_DAYS;
  const buckets = labels.length;

  // Reparte las alertas de mantenimiento reales por periodo para estimar
  // cuantos buses estuvieron en taller cada dia o semana.
  const total = await prisma.vehicle.count();
  const alerts = await prisma.alert.findMany({
    where: { title: 'Unidad detenida' },
    select: { createdAt: true },
  });

  const inShop = new Array<number>(buckets).fill(0);
  for (const a of alerts) {
    const idx =
      query.range === 'month'
        ? Math.min(buckets - 1, Math.floor((a.createdAt.getDate() - 1) / 7))
        : a.createdAt.getDay() === 0
          ? 6
          : a.createdAt.getDay() - 1;
    inShop[idx] = (inShop[idx] ?? 0) + 1;
  }

  return labels.map((label, i) => {
    const count = inShop[i] ?? 0;
    const mant = total ? round1(Math.min(100, (count / total) * 100)) : 0;
    const operativa = round1(100 - mant);
    return { day: label, operativa, mantenimiento: mant };
  });
}

export interface RouteCompliancePoint {
  name: string;
  value: number;
  color: string;
}

// Cumplimiento real por ruta: buses operativos en la ruta sobre los buses
// asignados a esa ruta. Si una ruta no tiene buses asignados, se toma 0.
export async function getRouteCompliance(): Promise<RouteCompliancePoint[]> {
  const routes = await prisma.route.findMany({ orderBy: { code: 'asc' } });

  return Promise.all(
    routes.map(async (r) => {
      const running = await prisma.vehicle.count({
        where: { currentRouteCode: r.code, state: 'Operativo' },
      });
      const required = r.busesAssigned > 0 ? r.busesAssigned : running;
      const value = required > 0 ? round1(Math.min(100, (running / required) * 100)) : 0;
      const color = value >= 90 ? '#0f172a' : value >= 70 ? '#d4a15d' : '#b91c1c';
      return { name: r.code, value, color };
    }),
  );
}

export interface RecentAlert {
  id: string;
  title: string;
  text: string;
  time: string;
  tone: string;
}

export async function getRecentAlerts(query: DashboardAlertsQuery): Promise<RecentAlert[]> {
  const rows = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: query.limit });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    text: a.text,
    time: a.createdAt.toISOString(),
    tone: a.tone,
  }));
}
