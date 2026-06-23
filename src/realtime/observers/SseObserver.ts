import type { Response } from 'express';
import type { TelemetryObserver } from '../Observer.js';
import type { VehicleStatusDTO } from '../../modules/monitoring/monitoring.service.js';
import { sendEvent } from '../sse.js';

// Observador que reenvía cada actualización de telemetría al cliente SSE
export class SseObserver implements TelemetryObserver {
  constructor(private readonly res: Response) {}

  update(status: VehicleStatusDTO): void {
    // Envia al cliente SSE el estado del vehículo.
    sendEvent(this.res, status);
  }
}
