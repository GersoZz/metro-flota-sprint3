import type { LatLng } from '../../../lib/geo.js';

// Datos que cada regla necesita para decidir si un bus genera una alerta.
// Vienen del ultimo estado de telemetria de la unidad.
export interface TelemetrySample {
  vehicleId: string;
  routeCode: string | null;
  position: LatLng;
  speedKmh: number;
  routeStops: LatLng[];
  // Segundos que la unidad lleva sin moverse (0 si se esta moviendo).
  stoppedSeconds: number;
}

// Resultado cuando una regla detecta un evento.
export interface AlertHit {
  kind: string;
  title: string;
  text: string;
  tone: 'danger' | 'warning';
}

// Interface del rol Strategy: cada regla de alerta decide si aplica
// a una muestra de telemetria y, si aplica, describe la alerta.
export interface AlertRule {
  // Verifica si esta regla tiene los datos minimos para evaluar la muestra.
  applies(sample: TelemetrySample): boolean;

  // Evalua la muestra. Devuelve la alerta si se dispara, o null si no.
  evaluate(sample: TelemetrySample): AlertHit | null;
}
