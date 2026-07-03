import { env } from '../config/env.js';

const bearer = [{ bearerAuth: [] }];

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

const json = (ref: string) => ({
  'application/json': { schema: { $ref: `#/components/schemas/${ref}` } },
});

const pageParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
];

export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'MetroFlota API',
    version: '0.1.0',
    description:
      'API REST + tiempo real para la gestión de flota BRT MetroFlota.\n\n' +
      'Autenticación: `POST /auth/login` devuelve un `accessToken` (JWT) que va en ' +
      '`Authorization: Bearer <token>`. El refresh viaja en cookie httpOnly.\n\n' +
      'Healthcheck fuera del prefijo: `GET /health`.',
  },
  servers: [{ url: env.API_PREFIX, description: 'API (prefijo versionado)' }],
  tags: [
    { name: 'Auth', description: 'Autenticación y sesión' },
    { name: 'Flota', description: 'Vehículos' },
    { name: 'Rutas', description: 'Rutas y paradas' },
    { name: 'Catálogos', description: 'Consorcios y conductores' },
    { name: 'Alertas', description: 'Feed de alertas' },
    { name: 'Dashboard', description: 'Analítica del inicio' },
    { name: 'Monitoreo', description: 'Telemetría y tiempo real' },
    { name: 'GTFS', description: 'Exportación de datos en formato GTFS' },
  ],
  security: bearer,
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        security: [],
        requestBody: { required: true, content: json('LoginRequest') },
        responses: {
          200: { description: 'Sesión iniciada (+ cookie refreshToken)', content: json('LoginResponse') },
          401: errorResponse('Credenciales inválidas'),
          422: errorResponse('Body inválido'),
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión',
        security: [],
        responses: { 204: { description: 'Cookie limpiada' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token (usa la cookie refresh)',
        security: [],
        responses: {
          200: {
            description: 'Nuevo access token',
            content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } },
          },
          401: errorResponse('Refresh inválido o ausente'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Usuario autenticado actual',
        responses: { 200: { description: 'Usuario', content: json('User') }, 401: errorResponse('No autenticado') },
      },
    },

    '/vehicles': {
      get: {
        tags: ['Flota'],
        summary: 'Listar/buscar/filtrar/paginar flota',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'state', in: 'query', schema: { type: 'string', enum: ['Operativo', 'En Taller', 'Alerta'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['Bus Articulado', 'Alimentador'] } },
          { name: 'consortium', in: 'query', schema: { type: 'string' } },
          ...pageParams,
        ],
        responses: { 200: { description: 'Colección paginada', content: json('PaginatedVehicles') }, 401: errorResponse('No autenticado') },
      },
      post: {
        tags: ['Flota'],
        summary: 'Crear unidad (admin/operador)',
        requestBody: { required: true, content: json('VehicleCreate') },
        responses: {
          201: { description: 'Creada', content: json('Vehicle') },
          401: errorResponse('No autenticado'),
          403: errorResponse('Rol insuficiente'),
          409: errorResponse('Placa duplicada'),
          422: errorResponse('Body inválido'),
        },
      },
    },
    '/vehicles/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Flota'],
        summary: 'Detalle de una unidad',
        responses: { 200: { description: 'Unidad', content: json('Vehicle') }, 404: errorResponse('No encontrada') },
      },
      patch: {
        tags: ['Flota'],
        summary: 'Editar unidad (admin/operador)',
        requestBody: { required: true, content: json('VehicleUpdate') },
        responses: {
          200: { description: 'Actualizada', content: json('Vehicle') },
          403: errorResponse('Rol insuficiente'),
          404: errorResponse('No encontrada'),
        },
      },
      delete: {
        tags: ['Flota'],
        summary: 'Dar de baja unidad (admin/operador)',
        responses: { 204: { description: 'Eliminada' }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
    },

    '/routes': {
      get: {
        tags: ['Rutas'],
        summary: 'Listar rutas',
        parameters: [
          { name: 'state', in: 'query', schema: { type: 'string', enum: ['Activa', 'En Revisión', 'Suspendida'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['Troncal', 'Expreso', 'Alimentador'] } },
          ...pageParams,
        ],
        responses: { 200: { description: 'Colección paginada', content: json('PaginatedRoutes') } },
      },
      post: {
        tags: ['Rutas'],
        summary: 'Crear ruta (admin/operador)',
        requestBody: { required: true, content: json('RouteCreate') },
        responses: { 201: { description: 'Creada', content: json('Route') }, 403: errorResponse('Rol insuficiente') },
      },
    },
    '/routes/summary': {
      get: {
        tags: ['Rutas'],
        summary: 'Conteo de rutas por estado',
        responses: { 200: { description: 'Resumen', content: json('RoutesSummary') } },
      },
    },
    '/routes/{code}': {
      parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Rutas'],
        summary: 'Detalle de ruta (con paradas)',
        responses: { 200: { description: 'Ruta', content: json('RouteDetail') }, 404: errorResponse('No encontrada') },
      },
      patch: {
        tags: ['Rutas'],
        summary: 'Editar ruta (admin/operador)',
        requestBody: { required: true, content: json('RouteUpdate') },
        responses: { 200: { description: 'Actualizada', content: json('Route') }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
      delete: {
        tags: ['Rutas'],
        summary: 'Eliminar ruta (admin/operador)',
        responses: { 204: { description: 'Eliminada' }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
    },
    '/routes/{code}/stops': {
      parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Rutas'],
        summary: 'Paradas ordenadas de la ruta',
        responses: { 200: { description: 'Paradas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Stop' } } } } }, 404: errorResponse('No encontrada') },
      },
      post: {
        tags: ['Rutas'],
        summary: 'Añadir parada (admin/operador)',
        requestBody: { required: true, content: json('StopCreate') },
        responses: { 201: { description: 'Creada', content: json('Stop') }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('Ruta no encontrada') },
      },
    },
    '/stops/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      patch: {
        tags: ['Rutas'],
        summary: 'Editar/mover parada (admin/operador)',
        requestBody: { required: true, content: json('StopUpdate') },
        responses: { 200: { description: 'Actualizada', content: json('Stop') }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
      delete: {
        tags: ['Rutas'],
        summary: 'Eliminar parada (admin/operador)',
        responses: { 204: { description: 'Eliminada' }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
    },

    '/consortiums': {
      get: { tags: ['Catálogos'], summary: 'Lista de consorcios', responses: { 200: { description: 'Consorcios', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Consortium' } } } } } } },
    },
    '/drivers': {
      get: { tags: ['Catálogos'], summary: 'Lista de conductores', responses: { 200: { description: 'Conductores', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Driver' } } } } } } },
    },

    '/alerts': {
      get: {
        tags: ['Alertas'],
        summary: 'Feed de alertas',
        parameters: [
          { name: 'tone', in: 'query', schema: { type: 'string', enum: ['danger', 'warning'] } },
          { name: 'acknowledged', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          ...pageParams,
        ],
        responses: { 200: { description: 'Colección paginada', content: json('PaginatedAlerts') } },
      },
    },
    '/alerts/{id}/acknowledge': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      patch: {
        tags: ['Alertas'],
        summary: 'Marcar alerta como atendida (admin/operador/supervisor)',
        responses: { 200: { description: 'Alerta', content: json('Alert') }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
    },
    '/alerts/{id}/unacknowledge': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      patch: {
        tags: ['Alertas'],
        summary: 'Revertir a no atendida (admin/operador/supervisor)',
        responses: { 200: { description: 'Alerta', content: json('Alert') }, 403: errorResponse('Rol insuficiente'), 404: errorResponse('No encontrada') },
      },
    },

    '/dashboard/kpis': {
      get: { tags: ['Dashboard'], summary: 'KPIs de cabecera', responses: { 200: { description: 'KPIs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Kpi' } } } } } } },
    },
    '/dashboard/availability': {
      get: {
        tags: ['Dashboard'],
        summary: 'Serie operativa vs. mantenimiento',
        parameters: [{ name: 'range', in: 'query', schema: { type: 'string', enum: ['week', 'month'], default: 'week' } }],
        responses: { 200: { description: 'Serie', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AvailabilityPoint' } } } } }, 422: errorResponse('Range inválido') },
      },
    },
    '/dashboard/route-compliance': {
      get: { tags: ['Dashboard'], summary: 'Cumplimiento por ruta', responses: { 200: { description: 'Cumplimiento', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/RouteCompliance' } } } } } } },
    },
    '/dashboard/alerts': {
      get: {
        tags: ['Dashboard'],
        summary: 'Alertas recientes (panel/campana)',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 3 } }],
        responses: { 200: { description: 'Alertas recientes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/RecentAlert' } } } } } },
      },
    },

    '/monitoring/units': {
      get: { tags: ['Monitoreo'], summary: 'Unidades seguibles', responses: { 200: { description: 'Unidades', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/MonitoringUnit' } } } } } } },
    },
    '/monitoring/units/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Monitoreo'], summary: 'Telemetría (último snapshot)', responses: { 200: { description: 'VehicleStatus', content: json('VehicleStatus') }, 404: errorResponse('Sin telemetría') } },
    },
    '/monitoring/units/{id}/route': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Monitoreo'], summary: 'Progreso de paradas', responses: { 200: { description: 'Progreso', content: json('RouteProgress') }, 404: errorResponse('Sin telemetría') } },
    },
    '/monitoring/units/{id}/position': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Monitoreo'], summary: 'Posición + markers para el mapa', responses: { 200: { description: 'Posición', content: json('UnitPosition') }, 404: errorResponse('Sin telemetría') } },
    },
    '/monitoring/units/{id}/stream': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'access_token', in: 'query', schema: { type: 'string' }, description: 'Access token (alternativa al header Bearer; necesario para EventSource).' },
      ],
      get: {
        tags: ['Monitoreo'],
        summary: 'Stream SSE de telemetría en vivo',
        description: 'Server-Sent Events (text/event-stream). Emite un evento `VehicleStatus` al conectar y luego periódicamente.',
        responses: {
          200: { description: 'Stream SSE', content: { 'text/event-stream': { schema: { type: 'string' } } } },
          401: errorResponse('No autenticado'),
          404: errorResponse('Sin telemetría'),
        },
      },
    },
    '/gtfs/export': {
      get: {
        tags: ['GTFS'],
        summary: 'Exporta el feed GTFS (RF-24)',
        description:
          'Devuelve los archivos del feed GTFS (agency, routes, stops, trips, stop_times) ' +
          'en formato CSV, uno por campo. Se arma con datos reales de rutas y paradas.',
        responses: {
          200: { description: 'Feed GTFS', content: { 'application/json': { schema: { $ref: '#/components/schemas/GtfsFeed' } } } },
          401: errorResponse('No autenticado'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: { code: { type: 'string' }, message: { type: 'string' }, details: {} },
            required: ['code', 'message'],
          },
        },
      },
      Meta: {
        type: 'object',
        properties: { total: { type: 'integer' }, page: { type: 'integer' }, pageSize: { type: 'integer' } },
      },
      GtfsFeed: {
        type: 'object',
        description: 'Cada campo es un archivo del feed GTFS en formato CSV.',
        properties: {
          'agency.txt': { type: 'string' },
          'routes.txt': { type: 'string' },
          'stops.txt': { type: 'string' },
          'trips.txt': { type: 'string' },
          'stop_times.txt': { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email', example: 'admin@metroflota.gob.pe' }, password: { type: 'string', example: 'admin1234' } },
      },
      LoginResponse: {
        type: 'object',
        properties: { user: { $ref: '#/components/schemas/User' }, accessToken: { type: 'string' } },
      },
      User: {
        type: 'object',
        properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string', enum: ['admin', 'operador', 'supervisor'] } },
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ART-1042' },
          plate: { type: 'string', example: 'A2F-741' },
          type: { type: 'string', enum: ['Bus Articulado', 'Alimentador'] },
          consortium: { type: 'string', example: 'Lima Vías Express' },
          km: { type: 'integer', example: 145230 },
          state: { type: 'string', enum: ['Operativo', 'En Taller', 'Alerta'] },
          lastInspectionDate: { type: 'string', format: 'date', example: '2023-10-12' },
        },
      },
      VehicleCreate: {
        type: 'object',
        required: ['id', 'plate', 'type', 'consortium', 'lastInspectionDate'],
        properties: {
          id: { type: 'string' },
          plate: { type: 'string' },
          type: { type: 'string', enum: ['Bus Articulado', 'Alimentador'] },
          consortium: { type: 'string', description: 'Nombre del consorcio' },
          km: { type: 'integer', default: 0 },
          state: { type: 'string', enum: ['Operativo', 'En Taller', 'Alerta'], default: 'Operativo' },
          lastInspectionDate: { type: 'string', format: 'date' },
          currentRouteCode: { type: 'string', nullable: true },
        },
      },
      VehicleUpdate: {
        type: 'object',
        properties: {
          plate: { type: 'string' },
          type: { type: 'string', enum: ['Bus Articulado', 'Alimentador'] },
          consortium: { type: 'string' },
          km: { type: 'integer' },
          state: { type: 'string', enum: ['Operativo', 'En Taller', 'Alerta'] },
          lastInspectionDate: { type: 'string', format: 'date' },
          currentRouteCode: { type: 'string', nullable: true },
        },
      },
      PaginatedVehicles: {
        type: 'object',
        properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Vehicle' } }, meta: { $ref: '#/components/schemas/Meta' } },
      },
      Route: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'TR-A' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['Troncal', 'Expreso', 'Alimentador'] },
          stops: { type: 'integer', description: 'Conteo de paradas' },
          length: { type: 'number', example: 33.2 },
          frequencyMinutes: { type: 'integer' },
          buses: { type: 'integer' },
          state: { type: 'string', enum: ['Activa', 'En Revisión', 'Suspendida'] },
        },
      },
      RouteDetail: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['Troncal', 'Expreso', 'Alimentador'] },
          stopsCount: { type: 'integer' },
          length: { type: 'number' },
          frequencyMinutes: { type: 'integer' },
          buses: { type: 'integer' },
          state: { type: 'string', enum: ['Activa', 'En Revisión', 'Suspendida'] },
          stops: { type: 'array', items: { $ref: '#/components/schemas/Stop' } },
        },
      },
      RouteCreate: {
        type: 'object',
        required: ['code', 'name', 'type', 'length', 'frequencyMinutes'],
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['Troncal', 'Expreso', 'Alimentador'] },
          length: { type: 'number' },
          frequencyMinutes: { type: 'integer' },
          buses: { type: 'integer', default: 0 },
          state: { type: 'string', enum: ['Activa', 'En Revisión', 'Suspendida'], default: 'Activa' },
        },
      },
      RouteUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['Troncal', 'Expreso', 'Alimentador'] },
          length: { type: 'number' },
          frequencyMinutes: { type: 'integer' },
          buses: { type: 'integer' },
          state: { type: 'string', enum: ['Activa', 'En Revisión', 'Suspendida'] },
        },
      },
      PaginatedRoutes: {
        type: 'object',
        properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Route' } }, meta: { $ref: '#/components/schemas/Meta' } },
      },
      RoutesSummary: {
        type: 'object',
        properties: { total: { type: 'integer' }, active: { type: 'integer' }, review: { type: 'integer' }, suspended: { type: 'integer' } },
      },
      Stop: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          order: { type: 'integer' },
          lat: { type: 'number', nullable: true },
          lng: { type: 'number', nullable: true },
        },
      },
      StopCreate: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string' }, order: { type: 'integer', minimum: 1 }, lat: { type: 'number', nullable: true }, lng: { type: 'number', nullable: true } },
      },
      StopUpdate: {
        type: 'object',
        properties: { name: { type: 'string' }, order: { type: 'integer', minimum: 1 }, lat: { type: 'number', nullable: true }, lng: { type: 'number', nullable: true } },
      },
      Consortium: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
      Driver: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, licenseNumber: { type: 'string' } } },
      Alert: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          text: { type: 'string' },
          tone: { type: 'string', enum: ['danger', 'warning'] },
          vehicleId: { type: 'string', nullable: true },
          routeCode: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          acknowledgedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      PaginatedAlerts: {
        type: 'object',
        properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Alert' } }, meta: { $ref: '#/components/schemas/Meta' } },
      },
      Kpi: {
        type: 'object',
        properties: { title: { type: 'string' }, value: { type: 'number' }, delta: { type: 'string' }, subtitle: { type: 'string' }, accent: { type: 'string' } },
      },
      AvailabilityPoint: {
        type: 'object',
        properties: { day: { type: 'string' }, operativa: { type: 'number' }, mantenimiento: { type: 'number' } },
      },
      RouteCompliance: {
        type: 'object',
        properties: { name: { type: 'string' }, value: { type: 'number' }, color: { type: 'string' } },
      },
      RecentAlert: {
        type: 'object',
        properties: { id: { type: 'string' }, title: { type: 'string' }, text: { type: 'string' }, time: { type: 'string', format: 'date-time' }, tone: { type: 'string', enum: ['danger', 'warning'] } },
      },
      MonitoringUnit: { type: 'object', properties: { id: { type: 'string' }, label: { type: 'string' } } },
      VehicleStatus: {
        type: 'object',
        properties: {
          unitId: { type: 'string' },
          speedKmh: { type: 'integer' },
          driver: { type: 'string', nullable: true },
          passengers: { type: 'integer' },
          capacity: { type: 'integer' },
          nextStop: { type: 'string', nullable: true },
          routeCode: { type: 'string', nullable: true },
          position: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
        },
      },
      RouteProgress: {
        type: 'object',
        properties: {
          routeCode: { type: 'string', nullable: true },
          stops: {
            type: 'array',
            items: { type: 'object', properties: { name: { type: 'string' }, time: { type: 'string' }, active: { type: 'boolean' } } },
          },
        },
      },
      UnitPosition: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          markers: {
            type: 'array',
            items: { type: 'object', properties: { name: { type: 'string' }, order: { type: 'integer' }, lat: { type: 'number' }, lng: { type: 'number' } } },
          },
        },
      },
    },
  },
} as const;
