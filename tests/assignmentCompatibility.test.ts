import { describe, expect, it } from 'vitest';
import { allowedRouteTypes, isCompatible } from '../src/modules/assignment/compatibility.js';

describe('Compatibilidad bus <-> ruta (RF-08)', () => {
  it('un bus articulado opera en troncal y expreso', () => {
    expect(isCompatible('BusArticulado', 'Troncal')).toBe(true);
    expect(isCompatible('BusArticulado', 'Expreso')).toBe(true);
  });

  it('un bus articulado no opera en alimentador', () => {
    expect(isCompatible('BusArticulado', 'Alimentador')).toBe(false);
  });

  it('un alimentador solo opera en ruta alimentadora', () => {
    expect(isCompatible('Alimentador', 'Alimentador')).toBe(true);
    expect(isCompatible('Alimentador', 'Troncal')).toBe(false);
    expect(isCompatible('Alimentador', 'Expreso')).toBe(false);
  });

  it('allowedRouteTypes lista los tipos permitidos por tipo de bus', () => {
    expect(allowedRouteTypes('BusArticulado')).toEqual(['Troncal', 'Expreso']);
    expect(allowedRouteTypes('Alimentador')).toEqual(['Alimentador']);
  });
});
