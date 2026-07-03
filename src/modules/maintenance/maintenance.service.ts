import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  paginationQuerySchema,
  paginated,
  toSkipTake,
  type Pagination,
} from '../../lib/pagination.js';
import { AppError } from '../../lib/AppError.js';
import type {
  CreateMaintenanceBody,
  ListMaintenanceQuery,
  UpdateMaintenanceBody,
} from './maintenance.schema.js';

type MaintenanceRow = Prisma.MaintenanceGetPayload<object>;

export interface MaintenanceDTO {
  id: string;
  vehicleId: string;
  type: string;
  status: string;
  description: string;
  thresholdKm: number | null;
  scheduledDate: string | null;
  executedDate: string | null;
  components: string | null;
  costEstimate: number | null;
  hours: number | null;
  technician: string | null;
  createdAt: string;
}

const toDateString = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);

function toDTO(m: MaintenanceRow): MaintenanceDTO {
  return {
    id: m.id,
    vehicleId: m.vehicleId,
    type: m.type,
    status: m.status,
    description: m.description,
    thresholdKm: m.thresholdKm,
    scheduledDate: toDateString(m.scheduledDate),
    executedDate: toDateString(m.executedDate),
    components: m.components,
    costEstimate: m.costEstimate ? Number(m.costEstimate) : null,
    hours: m.hours ? Number(m.hours) : null,
    technician: m.technician,
    createdAt: m.createdAt.toISOString(),
  };
}

function buildWhere(query: ListMaintenanceQuery): Prisma.MaintenanceWhereInput {
  const where: Prisma.MaintenanceWhereInput = {};
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  return where;
}

export async function listMaintenance(query: ListMaintenanceQuery) {
  const pagination: Pagination = paginationQuerySchema.parse(query);
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...toSkipTake(pagination),
    }),
    prisma.maintenance.count({ where }),
  ]);

  return paginated(rows.map(toDTO), total, pagination);
}

export async function getMaintenance(id: string): Promise<MaintenanceDTO> {
  const row = await prisma.maintenance.findUnique({ where: { id } });
  if (!row) throw AppError.notFound(`Mantenimiento no encontrado: ${id}`);
  return toDTO(row);
}

async function assertVehicleExists(vehicleId: string): Promise<void> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw AppError.notFound(`Vehiculo no encontrado: ${vehicleId}`);
}

export async function createMaintenance(body: CreateMaintenanceBody): Promise<MaintenanceDTO> {
  await assertVehicleExists(body.vehicleId);
  const row = await prisma.maintenance.create({
    data: {
      vehicleId: body.vehicleId,
      type: body.type,
      description: body.description,
      thresholdKm: body.thresholdKm ?? null,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      executedDate: body.executedDate ? new Date(body.executedDate) : null,
      components: body.components ?? null,
      costEstimate: body.costEstimate ?? null,
      hours: body.hours ?? null,
      technician: body.technician ?? null,
    },
  });
  return toDTO(row);
}

export async function updateMaintenance(
  id: string,
  body: UpdateMaintenanceBody,
): Promise<MaintenanceDTO> {
  const existing = await prisma.maintenance.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound(`Mantenimiento no encontrado: ${id}`);

  const data: Prisma.MaintenanceUpdateInput = {};
  if (body.type !== undefined) data.type = body.type;
  if (body.status !== undefined) data.status = body.status;
  if (body.description !== undefined) data.description = body.description;
  if (body.thresholdKm !== undefined) data.thresholdKm = body.thresholdKm;
  if (body.scheduledDate !== undefined)
    data.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
  if (body.executedDate !== undefined)
    data.executedDate = body.executedDate ? new Date(body.executedDate) : null;
  if (body.components !== undefined) data.components = body.components;
  if (body.costEstimate !== undefined) data.costEstimate = body.costEstimate;
  if (body.hours !== undefined) data.hours = body.hours;
  if (body.technician !== undefined) data.technician = body.technician;

  const row = await prisma.maintenance.update({ where: { id }, data });
  return toDTO(row);
}

export async function deleteMaintenance(id: string): Promise<void> {
  const existing = await prisma.maintenance.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound(`Mantenimiento no encontrado: ${id}`);
  await prisma.maintenance.delete({ where: { id } });
}
