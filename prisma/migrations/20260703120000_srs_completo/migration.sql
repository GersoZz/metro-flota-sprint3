-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('Diesel', 'GNV', 'Eléctrico');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('Laborable', 'Sábado', 'Domingo');

-- CreateEnum
CREATE TYPE "TimeBand" AS ENUM ('Pico Mañana', 'Pico Tarde', 'Valle', 'Baja');

-- AlterEnum
ALTER TYPE "VehicleState" ADD VALUE 'Dado de Baja';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'planificador';
ALTER TYPE "UserRole" ADD VALUE 'jefe_mantenimiento';
ALTER TYPE "UserRole" ADD VALUE 'directivo';

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "fuelType" "FuelType",
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "frequency_bands" (
    "id" TEXT NOT NULL,
    "dayType" "DayType" NOT NULL,
    "timeBand" "TimeBand" NOT NULL,
    "intervalMinutes" INTEGER NOT NULL,
    "routeCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frequency_bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_versions" (
    "id" TEXT NOT NULL,
    "routeCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RouteType" NOT NULL,
    "lengthKm" DECIMAL(6,2) NOT NULL,
    "frequencyMinutes" INTEGER NOT NULL,
    "state" "RouteState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "frequency_bands_routeCode_idx" ON "frequency_bands"("routeCode");

-- CreateIndex
CREATE UNIQUE INDEX "frequency_bands_routeCode_dayType_timeBand_key" ON "frequency_bands"("routeCode", "dayType", "timeBand");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "route_versions_routeCode_version_idx" ON "route_versions"("routeCode", "version" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "route_versions_routeCode_version_key" ON "route_versions"("routeCode", "version");

-- AddForeignKey
ALTER TABLE "frequency_bands" ADD CONSTRAINT "frequency_bands_routeCode_fkey" FOREIGN KEY ("routeCode") REFERENCES "routes"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
