import { describe, expect, it } from 'vitest';
import { nearByKm, nearByDate } from '../src/modules/maintenance/maintenanceThresholds.js';

describe('nearByKm', () => {
  it('avisa cuando faltan 5000 km o menos', () => {
    // Umbral 100000, el bus va en 96000: faltan 4000 km.
    expect(nearByKm(96000, 100000)).toBe(true);
  });

  it('no avisa cuando aun falta mucho', () => {
    // Faltan 20000 km.
    expect(nearByKm(80000, 100000)).toBe(false);
  });

  it('no avisa si ya paso el umbral', () => {
    expect(nearByKm(101000, 100000)).toBe(false);
  });

  it('no avisa cuando no hay umbral de km', () => {
    expect(nearByKm(50000, null)).toBe(false);
  });
});

describe('nearByDate', () => {
  const now = new Date('2026-07-03T00:00:00Z');

  it('avisa cuando faltan 7 dias o menos', () => {
    const soon = new Date('2026-07-08T00:00:00Z'); // faltan 5 dias
    expect(nearByDate(soon, now)).toBe(true);
  });

  it('no avisa cuando falta mas de una semana', () => {
    const later = new Date('2026-07-20T00:00:00Z');
    expect(nearByDate(later, now)).toBe(false);
  });

  it('no avisa para una fecha ya pasada', () => {
    const past = new Date('2026-07-01T00:00:00Z');
    expect(nearByDate(past, now)).toBe(false);
  });

  it('no avisa cuando no hay fecha programada', () => {
    expect(nearByDate(null, now)).toBe(false);
  });
});
