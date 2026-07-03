import { prisma } from '../../lib/prisma.js';
import {
  GtfsFeedBuilder,
  type GtfsFeed,
  type GtfsStop,
  type GtfsStopTime,
  type GtfsTrip,
} from './gtfs.builder.js';

// Arma el feed GTFS con los datos reales de rutas y paradas.
// Cubre el requisito RF-24 del SRS.
export async function exportGtfsFeed(): Promise<GtfsFeed> {
  const routes = await prisma.route.findMany({ orderBy: { code: 'asc' } });
  const stops = await prisma.stop.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    orderBy: [{ routeCode: 'asc' }, { order: 'asc' }],
  });

  const gtfsStops: GtfsStop[] = stops.map((s) => ({
    id: s.id,
    name: s.name,
    lat: Number(s.lat),
    lng: Number(s.lng),
  }));

  // Un viaje por ruta, suficiente para publicar la secuencia de paradas.
  const trips: GtfsTrip[] = routes.map((r) => ({
    routeCode: r.code,
    tripId: `${r.code}-T1`,
  }));

  const stopTimes: GtfsStopTime[] = stops.map((s) => ({
    tripId: `${s.routeCode}-T1`,
    stopId: s.id,
    order: s.order,
  }));

  return new GtfsFeedBuilder()
    .withRoutes(routes.map((r) => ({ code: r.code, name: r.name, type: r.type })))
    .withStops(gtfsStops)
    .withTrips(trips)
    .withStopTimes(stopTimes)
    .build();
}
