import { describe, expect, it } from 'vitest';
import {
  cycleTimeMinutes,
  headwayMinutes,
  avgWaitMinutes,
  busesNeededForHeadway,
  simulateScenario,
} from '../src/modules/simulation/simulationMath.js';

describe('cycleTimeMinutes', () => {
  it('calcula el tiempo de vuelta en minutos', () => {
    // 20 km a 40 km/h son 30 minutos de vuelta.
    expect(cycleTimeMinutes(20, 40)).toBe(30);
  });

  it('devuelve 0 cuando la longitud es 0', () => {
    expect(cycleTimeMinutes(0, 40)).toBe(0);
  });

  it('lanza error si la velocidad es 0 o negativa', () => {
    expect(() => cycleTimeMinutes(20, 0)).toThrow();
    expect(() => cycleTimeMinutes(20, -5)).toThrow();
  });

  it('lanza error si la longitud es negativa', () => {
    expect(() => cycleTimeMinutes(-1, 40)).toThrow();
  });
});

describe('headwayMinutes', () => {
  it('reparte el tiempo de vuelta entre los buses', () => {
    // 30 minutos de vuelta con 5 buses dan 6 minutos de headway.
    expect(headwayMinutes(30, 5)).toBe(6);
  });

  it('lanza error si no hay buses', () => {
    expect(() => headwayMinutes(30, 0)).toThrow();
    expect(() => headwayMinutes(30, -2)).toThrow();
  });
});

describe('avgWaitMinutes', () => {
  it('es la mitad del headway', () => {
    expect(avgWaitMinutes(6)).toBe(3);
  });
});

describe('busesNeededForHeadway', () => {
  it('redondea hacia arriba los buses necesarios', () => {
    // 30 minutos de vuelta y headway objetivo de 4 minutos: 30/4 = 7.5 -> 8 buses.
    expect(busesNeededForHeadway(30, 4)).toBe(8);
  });

  it('da un valor exacto cuando divide sin resto', () => {
    expect(busesNeededForHeadway(30, 5)).toBe(6);
  });

  it('lanza error si el headway objetivo es 0 o negativo', () => {
    expect(() => busesNeededForHeadway(30, 0)).toThrow();
    expect(() => busesNeededForHeadway(30, -1)).toThrow();
  });
});

describe('simulateScenario', () => {
  it('calcula todas las metricas del escenario', () => {
    const result = simulateScenario({ lengthKm: 20, avgSpeedKmh: 40, buses: 5 });
    expect(result.cycleTimeMinutes).toBe(30);
    expect(result.headwayMinutes).toBe(6);
    expect(result.avgWaitMinutes).toBe(3);
    expect(result.busesNeeded).toBeNull();
  });

  it('incluye buses necesarios cuando hay headway objetivo', () => {
    const result = simulateScenario({
      lengthKm: 20,
      avgSpeedKmh: 40,
      buses: 5,
      targetHeadwayMin: 4,
    });
    expect(result.busesNeeded).toBe(8);
  });

  it('redondea las metricas a dos decimales', () => {
    // 10 km a 30 km/h dan 20 minutos de vuelta, con 3 buses el headway es 6.6666...
    const result = simulateScenario({ lengthKm: 10, avgSpeedKmh: 30, buses: 3 });
    expect(result.cycleTimeMinutes).toBe(20);
    expect(result.headwayMinutes).toBe(6.67);
    expect(result.avgWaitMinutes).toBe(3.33);
  });
});
