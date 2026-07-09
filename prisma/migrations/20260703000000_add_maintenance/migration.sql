-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('Preventivo', 'Correctivo');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Programado', 'En Curso', 'Completado');

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'Programado',
    "description" TEXT NOT NULL,
    "thresholdKm" INTEGER,
    "scheduledDate" DATE,
    "executedDate" DATE,
    "components" TEXT,
    "costEstimate" DECIMAL(10,2),
    "hours" DECIMAL(6,2),
    "technician" TEXT,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenances_vehicleId_createdAt_idx" ON "maintenances"("vehicleId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
