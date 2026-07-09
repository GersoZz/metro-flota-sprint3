import { describe, expect, it } from 'vitest';
import {
  createMaintenanceSchema,
  listMaintenanceQuerySchema,
  updateMaintenanceSchema,
} from '../src/modules/maintenance/maintenance.schema.js';

describe('createMaintenanceSchema', () => {
  it('acepta un mantenimiento preventivo con umbral de km', () => {
    const parsed = createMaintenanceSchema.parse({
      vehicleId: 'ART-1042',
      type: 'Preventivo',
      description: 'Cambio de aceite',
      thresholdKm: 50000,
    });
    expect(parsed.type).toBe('Preventivo');
    expect(parsed.thresholdKm).toBe(50000);
  });

  it('acepta un correctivo con datos de ejecucion', () => {
    const parsed = createMaintenanceSchema.parse({
      vehicleId: 'ART-1042',
      type: 'Correctivo',
      description: 'Falla de frenos',
      executedDate: '2026-07-01',
      costEstimate: 1200.5,
      technician: 'Juan Perez',
    });
    expect(parsed.costEstimate).toBe(1200.5);
  });

  it('rechaza cuando falta la descripcion', () => {
    const result = createMaintenanceSchema.safeParse({
      vehicleId: 'ART-1042',
      type: 'Preventivo',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un tipo invalido', () => {
    const result = createMaintenanceSchema.safeParse({
      vehicleId: 'ART-1042',
      type: 'Otro',
      description: 'x',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateMaintenanceSchema', () => {
  it('permite cambiar solo el estado', () => {
    const parsed = updateMaintenanceSchema.parse({ status: 'Completado' });
    expect(parsed.status).toBe('Completado');
  });
});

describe('listMaintenanceQuerySchema', () => {
  it('acepta filtro por vehiculo y estado', () => {
    const parsed = listMaintenanceQuerySchema.parse({ vehicleId: 'ART-1042', status: 'Programado' });
    expect(parsed.vehicleId).toBe('ART-1042');
    expect(parsed.status).toBe('Programado');
  });
});
