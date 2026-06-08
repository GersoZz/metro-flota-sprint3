import { prisma } from '../../lib/prisma.js';

export interface ConsortiumDTO {
  id: string;
  name: string;
}

export async function listConsortiums(): Promise<ConsortiumDTO[]> {
  return prisma.consortium.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
