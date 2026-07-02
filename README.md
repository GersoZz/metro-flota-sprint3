# MetroFlota Backend

API REST y tiempo real para la gestion de flota del Metropolitano de Lima.
Curso CC3S2 Desarrollo de Software, proyecto MetroFlota (cliente ATU).

## Stack

- Express 5 + TypeScript
- Prisma 7 + PostgreSQL
- Socket.io y SSE para tiempo real
- Zod para validacion
- Vitest para pruebas

## Instalacion

```
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

La documentacion de la API queda en `/docs` (Swagger UI) y en `/openapi.json`.

## Scripts

- `npm run dev` levanta el servidor en modo desarrollo
- `npm run typecheck` revisa tipos sin compilar
- `npm test` corre las pruebas
- `npm run lint` revisa el estilo con ESLint

## Patrones de diseno

El backend usa varios patrones de diseno de forma intencional:

- **Observer**: `TelemetryBus` publica el estado de cada unidad a sus observadores
  (SSE y Socket.io) sin acoplar el productor con los consumidores.
- **Strategy**: las reglas de filtrado de listados (`FilterContext`) y las reglas de
  alerta de telemetria (`AlertRuleEngine`) se definen como estrategias intercambiables.
- **State**: `VehicleState` controla las transiciones validas del estado de un vehiculo.
- **Factory**: `VehicleStateFactory` crea el estado correcto a partir de su nombre.
- **Builder**: `GtfsFeedBuilder` arma el feed GTFS archivo por archivo.

## Cobertura del SRS

Ademas del CRUD de flota, rutas y paradas, y de la autenticacion con JWT y roles,
el backend implementa:

- **RF-14**: deteccion automatica de eventos. En cada tick del simulador se revisan
  tres reglas sobre la telemetria del bus: desvio de mas de 200 metros de la ruta,
  velocidad mayor a 60 km/h y unidad detenida por mas de 5 minutos. Cuando una regla
  se dispara se crea una alerta y se publica por el bus de telemetria. La distancia a
  la ruta se calcula con la formula de Haversine y la distancia de un punto a un
  segmento (ver `src/lib/geo.ts`).
- **RF-22, RF-23, RF-25**: los indicadores del dashboard (cumplimiento por ruta y
  disponibilidad de flota) se calculan con datos reales de la base, no con valores fijos.
- **RF-24**: exportacion del feed GTFS en `GET /gtfs/export`.
