import { describe, expect, it } from 'vitest';
import { GtfsFeedBuilder } from '../src/modules/gtfs/gtfs.builder.js';

describe('GtfsFeedBuilder', () => {
  it('genera los cinco archivos del feed', () => {
    const feed = new GtfsFeedBuilder().build();
    expect(Object.keys(feed)).toEqual([
      'agency.txt',
      'routes.txt',
      'stops.txt',
      'trips.txt',
      'stop_times.txt',
    ]);
  });

  it('pone la cabecera correcta en routes.txt y una fila por ruta', () => {
    const feed = new GtfsFeedBuilder()
      .withRoutes([{ code: 'T1', name: 'Troncal Norte', type: 'Troncal' }])
      .build();
    const lines = feed['routes.txt'].split('\n');
    expect(lines[0]).toBe('route_id,route_short_name,route_long_name,route_type');
    expect(lines[1]).toBe('T1,T1,Troncal Norte,3');
  });

  it('escapa los nombres que tienen comas', () => {
    const feed = new GtfsFeedBuilder()
      .withStops([{ id: 'S1', name: 'Naranjal, Norte', lat: -12.0, lng: -77.0 }])
      .build();
    expect(feed['stops.txt']).toContain('"Naranjal, Norte"');
  });

  it('ordena las paradas del viaje por su secuencia', () => {
    const feed = new GtfsFeedBuilder()
      .withStopTimes([
        { tripId: 'T1-T1', stopId: 'S1', order: 1 },
        { tripId: 'T1-T1', stopId: 'S2', order: 2 },
      ])
      .build();
    const lines = feed['stop_times.txt'].split('\n');
    expect(lines[0]).toBe('trip_id,stop_id,stop_sequence');
    expect(lines[1]).toBe('T1-T1,S1,1');
    expect(lines[2]).toBe('T1-T1,S2,2');
  });
});
