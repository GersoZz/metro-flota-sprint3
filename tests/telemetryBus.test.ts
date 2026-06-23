import { describe, expect, it, vi } from 'vitest';
import { TelemetryBus } from '../src/realtime/TelemetryBus.js';
import type { VehicleStatusDTO } from '../src/modules/monitoring/monitoring.service.js';

const fakeStatus = (speedKmh: number): VehicleStatusDTO =>
  ({ unitId: 'V-1', speedKmh } as VehicleStatusDTO);

describe('TelemetryBus (Observer)', () => {
  it('notifica a todos los observadores de una unidad', () => {
    const bus = new TelemetryBus();
    const received: number[] = [];
    bus.subscribe('V-1', { update: (s) => received.push(s.speedKmh) });
    bus.subscribe('V-1', { update: (s) => received.push(s.speedKmh) });

    bus.publish('V-1', fakeStatus(40));

    expect(received).toEqual([40, 40]);
  });

  it('no notifica a observadores de otra unidad', () => {
    const bus = new TelemetryBus();
    const other = vi.fn();
    bus.subscribe('V-2', { update: other });

    bus.publish('V-1', fakeStatus(50));

    expect(other).not.toHaveBeenCalled();
  });

  it('la función devuelta desuscribe y limpia la unidad', () => {
    const bus = new TelemetryBus();
    const observer = vi.fn();
    const off = bus.subscribe('V-1', { update: observer });

    expect(bus.hasObservers('V-1')).toBe(true);
    off();
    expect(bus.hasObservers('V-1')).toBe(false);

    bus.publish('V-1', fakeStatus(60));
    expect(observer).not.toHaveBeenCalled();
  });

  it('get() devuelve siempre la misma instancia compartida', () => {
    expect(TelemetryBus.get()).toBe(TelemetryBus.get());
  });
});
