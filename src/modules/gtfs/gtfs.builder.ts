// GTFS es un formato estandar para publicar datos de transporte publico.
// Cada archivo del feed es un CSV con una cabecera fija.
// Aca usamos el patron Builder para armar el feed archivo por archivo.

export interface GtfsRoute {
  code: string;
  name: string;
  type: string;
}

export interface GtfsStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface GtfsTrip {
  routeCode: string;
  tripId: string;
}

export interface GtfsStopTime {
  tripId: string;
  stopId: string;
  order: number;
}

// Devuelve el nombre de cada archivo del feed y su contenido CSV.
export interface GtfsFeed {
  'agency.txt': string;
  'routes.txt': string;
  'stops.txt': string;
  'trips.txt': string;
  'stop_times.txt': string;
}

// Escapa un campo CSV si tiene comas o comillas.
function csvField(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(row.map(csvField).join(','));
  }
  return lines.join('\n');
}

// El tipo de ruta de GTFS se identifica con un numero. 3 es autobus.
const GTFS_BUS_ROUTE_TYPE = 3;

export class GtfsFeedBuilder {
  private routes: GtfsRoute[] = [];
  private stops: GtfsStop[] = [];
  private trips: GtfsTrip[] = [];
  private stopTimes: GtfsStopTime[] = [];

  withRoutes(routes: GtfsRoute[]): this {
    this.routes = routes;
    return this;
  }

  withStops(stops: GtfsStop[]): this {
    this.stops = stops;
    return this;
  }

  withTrips(trips: GtfsTrip[]): this {
    this.trips = trips;
    return this;
  }

  withStopTimes(stopTimes: GtfsStopTime[]): this {
    this.stopTimes = stopTimes;
    return this;
  }

  private buildAgency(): string {
    return toCsv(
      ['agency_id', 'agency_name', 'agency_url', 'agency_timezone'],
      [['ATU', 'Metropolitano de Lima', 'https://www.gob.pe/atu', 'America/Lima']],
    );
  }

  private buildRoutes(): string {
    return toCsv(
      ['route_id', 'route_short_name', 'route_long_name', 'route_type'],
      this.routes.map((r) => [r.code, r.code, r.name, GTFS_BUS_ROUTE_TYPE]),
    );
  }

  private buildStops(): string {
    return toCsv(
      ['stop_id', 'stop_name', 'stop_lat', 'stop_lon'],
      this.stops.map((s) => [s.id, s.name, s.lat, s.lng]),
    );
  }

  private buildTrips(): string {
    return toCsv(
      ['route_id', 'trip_id'],
      this.trips.map((t) => [t.routeCode, t.tripId]),
    );
  }

  private buildStopTimes(): string {
    return toCsv(
      ['trip_id', 'stop_id', 'stop_sequence'],
      this.stopTimes.map((st) => [st.tripId, st.stopId, st.order]),
    );
  }

  build(): GtfsFeed {
    return {
      'agency.txt': this.buildAgency(),
      'routes.txt': this.buildRoutes(),
      'stops.txt': this.buildStops(),
      'trips.txt': this.buildTrips(),
      'stop_times.txt': this.buildStopTimes(),
    };
  }
}
