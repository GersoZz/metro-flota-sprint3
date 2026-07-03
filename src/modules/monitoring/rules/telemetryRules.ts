import { distanceToPolylineMeters } from '../../../lib/geo.js';
import type { AlertRule, AlertHit, TelemetrySample } from './AlertRule.js';

// Umbrales tomados del SRS, requisito RF-14.
const OFF_ROUTE_METERS = 200;
const OVERSPEED_KMH = 60;
const STOPPED_SECONDS = 5 * 60;

// Regla (a): el bus se aleja mas de 200 metros de su ruta asignada.
// Usa la distancia del punto a la polilinea de paradas.
export class OffRouteRule implements AlertRule {
  applies(sample: TelemetrySample): boolean {
    return sample.routeStops.length >= 2;
  }

  evaluate(sample: TelemetrySample): AlertHit | null {
    const dist = distanceToPolylineMeters(sample.position, sample.routeStops);
    if (dist <= OFF_ROUTE_METERS) return null;
    return {
      kind: 'off_route',
      title: 'Desvio de ruta',
      text: `La unidad ${sample.vehicleId} esta a ${Math.round(dist)} m de su ruta.`,
      tone: 'danger',
    };
  }
}

// Regla (c): el bus supera los 60 km/h en el corredor.
export class OverspeedRule implements AlertRule {
  applies(): boolean {
    return true;
  }

  evaluate(sample: TelemetrySample): AlertHit | null {
    if (sample.speedKmh <= OVERSPEED_KMH) return null;
    return {
      kind: 'overspeed',
      title: 'Exceso de velocidad',
      text: `La unidad ${sample.vehicleId} va a ${sample.speedKmh} km/h.`,
      tone: 'danger',
    };
  }
}

// Regla (b): el bus lleva mas de 5 minutos detenido fuera de una estacion.
export class StoppedTooLongRule implements AlertRule {
  applies(): boolean {
    return true;
  }

  evaluate(sample: TelemetrySample): AlertHit | null {
    if (sample.stoppedSeconds <= STOPPED_SECONDS) return null;
    const minutes = Math.floor(sample.stoppedSeconds / 60);
    return {
      kind: 'stopped',
      title: 'Unidad detenida',
      text: `La unidad ${sample.vehicleId} lleva ${minutes} min detenida.`,
      tone: 'warning',
    };
  }
}
