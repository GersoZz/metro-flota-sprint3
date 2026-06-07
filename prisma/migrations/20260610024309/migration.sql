-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Bus Articulado', 'Alimentador');

-- CreateEnum
CREATE TYPE "VehicleState" AS ENUM ('Operativo', 'En Taller', 'Alerta');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('Troncal', 'Expreso', 'Alimentador');

-- CreateEnum
CREATE TYPE "RouteState" AS ENUM ('Activa', 'En Revisión', 'Suspendida');

-- CreateEnum
CREATE TYPE "AlertTone" AS ENUM ('danger', 'warning');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'operador', 'supervisor');

-- CreateTable
CREATE TABLE "consortiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "consortiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "km" INTEGER NOT NULL DEFAULT 0,
    "state" "VehicleState" NOT NULL DEFAULT 'Operativo',
    "lastInspectionDate" DATE NOT NULL,
    "consortiumId" TEXT NOT NULL,
    "currentRouteCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RouteType" NOT NULL,
    "lengthKm" DECIMAL(6,2) NOT NULL,
    "frequencyMinutes" INTEGER NOT NULL,
    "busesAssigned" INTEGER NOT NULL DEFAULT 0,
    "state" "RouteState" NOT NULL DEFAULT 'Activa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "routeCode" TEXT NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_statuses" (
    "id" TEXT NOT NULL,
    "speedKmh" INTEGER NOT NULL,
    "passengers" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT,
    "nextStopId" TEXT,

    CONSTRAINT "vehicle_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "tone" "AlertTone" NOT NULL,
    "vehicleId" TEXT,
    "routeCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'operador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consortiums_name_key" ON "consortiums"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_state_idx" ON "vehicles"("state");

-- CreateIndex
CREATE INDEX "vehicles_consortiumId_idx" ON "vehicles"("consortiumId");

-- CreateIndex
CREATE INDEX "routes_state_idx" ON "routes"("state");

-- CreateIndex
CREATE INDEX "routes_type_idx" ON "routes"("type");

-- CreateIndex
CREATE INDEX "stops_routeCode_idx" ON "stops"("routeCode");

-- CreateIndex
CREATE UNIQUE INDEX "stops_routeCode_order_key" ON "stops"("routeCode", "order");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE INDEX "vehicle_statuses_vehicleId_recordedAt_idx" ON "vehicle_statuses"("vehicleId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "alerts_tone_idx" ON "alerts"("tone");

-- CreateIndex
CREATE INDEX "alerts_acknowledgedAt_idx" ON "alerts"("acknowledgedAt");

-- CreateIndex
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_consortiumId_fkey" FOREIGN KEY ("consortiumId") REFERENCES "consortiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_currentRouteCode_fkey" FOREIGN KEY ("currentRouteCode") REFERENCES "routes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_routeCode_fkey" FOREIGN KEY ("routeCode") REFERENCES "routes"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_statuses" ADD CONSTRAINT "vehicle_statuses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_statuses" ADD CONSTRAINT "vehicle_statuses_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_statuses" ADD CONSTRAINT "vehicle_statuses_nextStopId_fkey" FOREIGN KEY ("nextStopId") REFERENCES "stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_routeCode_fkey" FOREIGN KEY ("routeCode") REFERENCES "routes"("code") ON DELETE SET NULL ON UPDATE CASCADE;
