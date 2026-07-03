import { describe, expect, it } from 'vitest';
import type { TelemetrySample } from '../src/modules/monitoring/rules/AlertRule.js';
import {
  OffRouteRule,
  OverspeedRule,
  StoppedTooLongRule,
} from '../src/modules/monitoring/rules/telemetryRules.js';
import { telemetryAlertEngine } from '../src/modules/monitoring/rules/AlertRuleEngine.js';

// Ruta recta de tres paradas sobre la misma longitud.
const routeStops = [
  { lat: -12.05, lng: -77.05 },
  { lat: -12.04, lng: -77.05 },
  { lat: -12.03, lng: -77.05 },
];

const base = (over: Partial<TelemetrySample>): TelemetrySample => ({
  vehicleId: 'BUS-1',
  routeCode: 'T1',
  position: { lat: -12.045, lng: -77.05 },
  speedKmh: 30,
  routeStops,
  stoppedSeconds: 0,
  ...over,
});

describe('OffRouteRule', () => {
  it('no dispara cuando el bus esta sobre la ruta', () => {
    expect(new OffRouteRule().evaluate(base({}))).toBeNull();
  });

  it('dispara cuando el bus se aleja mas de 200 metros', () => {
    // 0.003 grados de longitud son mas de 300 metros en Lima.
    const hit = new OffRouteRule().evaluate(base({ position: { lat: -12.045, lng: -77.047 } }));
    expect(hit?.kind).toBe('off_route');
  });
});

describe('OverspeedRule', () => {
  it('no dispara a 60 km/h o menos', () => {
    expect(new OverspeedRule().evaluate(base({ speedKmh: 60 }))).toBeNull();
  });

  it('dispara pasando los 60 km/h', () => {
    expect(new OverspeedRule().evaluate(base({ speedKmh: 75 }))?.kind).toBe('overspeed');
  });
});

describe('StoppedTooLongRule', () => {
  it('no dispara antes de 5 minutos', () => {
    expect(new StoppedTooLongRule().evaluate(base({ stoppedSeconds: 120 }))).toBeNull();
  });

  it('dispara pasados los 5 minutos', () => {
    expect(new StoppedTooLongRule().evaluate(base({ stoppedSeconds: 400 }))?.kind).toBe('stopped');
  });
});

describe('telemetryAlertEngine', () => {
  it('junta varias alertas de la misma muestra', () => {
    const hits = telemetryAlertEngine.run(
      base({ position: { lat: -12.045, lng: -77.047 }, speedKmh: 80 }),
    );
    const kinds = hits.map((h) => h.kind);
    expect(kinds).toContain('off_route');
    expect(kinds).toContain('overspeed');
  });

  it('no devuelve alertas cuando todo esta normal', () => {
    expect(telemetryAlertEngine.run(base({}))).toEqual([]);
  });
});
