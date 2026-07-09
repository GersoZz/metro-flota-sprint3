import { prisma } from '../../lib/prisma.js';
import { nearByKm, nearByDate } from './maintenanceThresholds.js';

// Evita duplicar la alerta si ya hay una activa para ese mantenimiento.
async function alreadyOpen(vehicleId: string, title: string): Promise<boolean> {
  const found = await prisma.alert.findFirst({
    where: { vehicleId, title, acknowledgedAt: null },
  });
  return found !== null;
}

// Genera alertas para los mantenimientos preventivos programados que ya estan
// cerca de su umbral de kilometraje o de fecha. Devuelve cuantas alertas creo.
export async function generateMaintenanceAlerts(now: Date): Promise<number> {
  const pending = await prisma.maintenance.findMany({
    where: { type: 'Preventivo', status: 'Programado' },
    include: { vehicle: { select: { id: true, plate: true, km: true } } },
  });

  let created = 0;
  for (const m of pending) {
    const near = nearByKm(m.vehicle.km, m.thresholdKm) || nearByDate(m.scheduledDate, now);
    if (!near) continue;

    const title = 'Mantenimiento proximo';
    if (await alreadyOpen(m.vehicle.id, title)) continue;

    await prisma.alert.create({
      data: {
        title,
        text: `La unidad ${m.vehicle.plate} esta cerca de su mantenimiento: ${m.description}.`,
        tone: 'warning',
        vehicleId: m.vehicle.id,
      },
    });
    created += 1;
  }
  return created;
}
