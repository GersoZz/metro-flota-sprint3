import { prisma } from '../../lib/prisma.js';

export interface DriverDTO {
  id: string;
  name: string;
  licenseNumber: string;
}

export async function listDrivers(): Promise<DriverDTO[]> {
  return prisma.driver.findMany({
    select: { id: true, name: true, licenseNumber: true },
    orderBy: { name: 'asc' },
  });
}
