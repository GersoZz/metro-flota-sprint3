import { prisma } from '../../lib/prisma.js';
import { routeStateToDisplay } from '../../lib/domainEnums.js';
import type { AvailabilityQuery, DashboardAlertsQuery } from './dashboard.schema.js';

const round1 = (n: number): number => Math.round(n * 10) / 10;
const codeHash = (s: string): number =>
  [...s].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

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
  const [total, enTaller] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { state: 'EnTaller' } }),
  ]);
  const baseAvailable = total ? ((total - enTaller) / total) * 100 : 0;

  const labels = query.range === 'month' ? MONTH_WEEKS : WEEK_DAYS;
  return labels.map((label, i) => {
    const variation = ((i * 7) % 11) - 5; // -5..+5 determinista
    const operativa = Math.max(0, Math.min(100, round1(baseAvailable + variation)));
    return { day: label, operativa, mantenimiento: round1(100 - operativa) };
  });
}

export interface RouteCompliancePoint {
  name: string;
  value: number;
  color: string;
}

const COMPLIANCE_BY_STATE: Record<keyof typeof routeStateToDisplay, number> = {
  Activa: 95,
  EnRevision: 78,
  Suspendida: 45,
};

export async function getRouteCompliance(): Promise<RouteCompliancePoint[]> {
  const routes = await prisma.route.findMany({ orderBy: { code: 'asc' } });
  return routes.map((r) => {
    const value = Math.max(0, Math.min(100, COMPLIANCE_BY_STATE[r.state] + (codeHash(r.code) % 5) - 2));
    const color = value >= 90 ? '#0f172a' : value >= 70 ? '#d4a15d' : '#b91c1c';
    return { name: r.code, value, color };
  });
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
