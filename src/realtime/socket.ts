import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../modules/auth/tokens.js';
import { getUnitStatus, type VehicleStatusDTO } from '../modules/monitoring/monitoring.service.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { telemetryBus } from './TelemetryBus.js';
import { SocketObserver } from './observers/SocketObserver.js';

interface SocketData {
  user: { id: string; role: string };
  // Para desuscribir el observador de este socket
  units: Map<string, () => void>;
}

interface ServerToClientEvents {
  status: (status: VehicleStatusDTO) => void;
  error: (err: { message: string }) => void;
}

interface ClientToServerEvents {
  subscribe: (payload: unknown) => void;
  unsubscribe: (payload: unknown) => void;
}

type MetroSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

const readUnitId = (payload: unknown): string | undefined => {
  const unitId = (payload as { unitId?: unknown } | undefined)?.unitId;
  return typeof unitId === 'string' ? unitId : undefined;
};

export function initSocket(httpServer: HttpServer): MetroSocketServer {
  const io: MetroSocketServer = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const fromAuth = (socket.handshake.auth as { token?: unknown }).token;
    const fromQuery = socket.handshake.query.token;
    const token =
      typeof fromAuth === 'string'
        ? fromAuth
        : typeof fromQuery === 'string'
          ? fromQuery
          : undefined;
    if (!token) {
      next(new Error('unauthorized'));
      return;
    }
    try {
      const { sub, role } = verifyAccessToken(token);
      socket.data.user = { id: sub, role };
      socket.data.units = new Map();
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('subscribe', (payload: unknown) => {
      const unitId = readUnitId(payload);
      if (!unitId) {
        socket.emit('error', { message: 'unitId requerido' });
        return;
      }
      if (socket.data.units.has(unitId)) return; // ya suscrito
      getUnitStatus(unitId)
        .then((status) => {
          // Este observador reenvía al cliente Socket.IO.
          const unsubscribe = telemetryBus.subscribe(unitId, new SocketObserver(socket));
          socket.data.units.set(unitId, unsubscribe);
          socket.emit('status', status);
        })
        .catch(() => socket.emit('error', { message: `Unidad sin telemetría: ${unitId}` }));
    });

    socket.on('unsubscribe', (payload: unknown) => {
      const unitId = readUnitId(payload);
      const unsubscribe = unitId ? socket.data.units.get(unitId) : undefined;
      if (unitId && unsubscribe) {
        unsubscribe();
        socket.data.units.delete(unitId);
      }
    });

    socket.on('disconnect', () => {
      for (const unsubscribe of socket.data.units.values()) unsubscribe();
      socket.data.units.clear();
    });
  });

  logger.info('Socket.IO inicializado');
  return io;
}
