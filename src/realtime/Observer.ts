import type { VehicleStatusDTO } from '../modules/monitoring/monitoring.service.js';

// Interface del rol Observer
// para cada transporte en realtime(SSE, Socket.io, ...)
export interface TelemetryObserver {
  update(status: VehicleStatusDTO): void;
}
