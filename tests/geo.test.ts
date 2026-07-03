import { describe, expect, it } from 'vitest';
import {
  haversineMeters,
  distancePointToSegmentMeters,
  distanceToPolylineMeters,
} from '../src/lib/geo.js';

describe('haversineMeters', () => {
  it('devuelve 0 cuando los dos puntos son iguales', () => {
    const p = { lat: -12.05, lng: -77.05 };
    expect(haversineMeters(p, p)).toBe(0);
  });

  it('mide una distancia corta con error menor a 1 metro', () => {
    // Dos puntos separados 0.001 grados de latitud (cerca de 111 metros).
    const a = { lat: -12.05, lng: -77.05 };
    const b = { lat: -12.049, lng: -77.05 };
    const d = haversineMeters(a, b);
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });
});

describe('distancePointToSegmentMeters', () => {
  it('da 0 cuando el punto esta sobre el segmento', () => {
    const a = { lat: -12.05, lng: -77.05 };
    const b = { lat: -12.04, lng: -77.05 };
    const p = { lat: -12.045, lng: -77.05 };
    expect(distancePointToSegmentMeters(p, a, b)).toBeLessThan(1);
  });

  it('mide la distancia perpendicular a un tramo', () => {
    // El punto esta al lado del segmento vertical, a unos 0.001 grados de longitud.
    const a = { lat: -12.05, lng: -77.05 };
    const b = { lat: -12.04, lng: -77.05 };
    const p = { lat: -12.045, lng: -77.049 };
    const d = distancePointToSegmentMeters(p, a, b);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });
});

describe('distanceToPolylineMeters', () => {
  it('devuelve Infinity con una linea vacia', () => {
    expect(distanceToPolylineMeters({ lat: 0, lng: 0 }, [])).toBe(Infinity);
  });

  it('toma el tramo mas cercano de la ruta', () => {
    const line = [
      { lat: -12.05, lng: -77.05 },
      { lat: -12.04, lng: -77.05 },
      { lat: -12.03, lng: -77.05 },
    ];
    // Punto cerca del primer tramo.
    const p = { lat: -12.045, lng: -77.0505 };
    const d = distanceToPolylineMeters(p, line);
    expect(d).toBeLessThan(80);
  });
});
