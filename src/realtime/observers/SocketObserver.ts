import type { TelemetryObserver } from '../Observer.js';
import type { VehicleStatusDTO } from '../../modules/monitoring/monitoring.service.js';

// interface para emitir el evento `status` a un cliente
export interface StatusEmitter {
  emit(event: 'status', status: VehicleStatusDTO): void;
}

// Observador que reenvía cada actualización de telemetría a un cliente Socket.IO
export class SocketObserver implements TelemetryObserver {
  constructor(private readonly socket: StatusEmitter) {}

  update(status: VehicleStatusDTO): void {
    this.socket.emit('status', status);
  }
}
