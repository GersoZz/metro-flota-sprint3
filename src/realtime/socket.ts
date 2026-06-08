import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../modules/auth/tokens.js';
import { getUnitStatus, type VehicleStatusDTO } from '../modules/monitoring/monitoring.service.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

interface SocketData {
  user: { id: string; role: string };
  units: Set<string>;
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

const room = (unitId: string): string => `unit:${unitId}`;

const broadcasters = new Map<string, { timer: NodeJS.Timeout; subscribers: number }>();

function acquireBroadcaster(io: MetroSocketServer, unitId: string): void {
  const existing = broadcasters.get(unitId);
  if (existing) {
    existing.subscribers += 1;
    return;
  }
  const timer = setInterval(() => {
    getUnitStatus(unitId)
      .then((status) => io.to(room(unitId)).emit('status', status))
      .catch(() => {
      });
  }, env.TELEMETRY_SIM_INTERVAL_MS);
  timer.unref?.();
  broadcasters.set(unitId, { timer, subscribers: 1 });
}

function releaseBroadcaster(unitId: string): void {
  const entry = broadcasters.get(unitId);
  if (!entry) return;
  entry.subscribers -= 1;
  if (entry.subscribers <= 0) {
    clearInterval(entry.timer);
    broadcasters.delete(unitId);
  }
}

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
      socket.data.units = new Set();
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
      getUnitStatus(unitId)
        .then(async (status) => {
          await socket.join(room(unitId));
          socket.data.units.add(unitId);
          acquireBroadcaster(io, unitId);
          socket.emit('status', status);
        })
        .catch(() => socket.emit('error', { message: `Unidad sin telemetría: ${unitId}` }));
    });

    socket.on('unsubscribe', (payload: unknown) => {
      const unitId = readUnitId(payload);
      if (unitId && socket.data.units.has(unitId)) {
        void socket.leave(room(unitId));
        socket.data.units.delete(unitId);
        releaseBroadcaster(unitId);
      }
    });

    socket.on('disconnect', () => {
      for (const unitId of socket.data.units) releaseBroadcaster(unitId);
    });
  });

  logger.info('Socket.IO inicializado');
  return io;
}
