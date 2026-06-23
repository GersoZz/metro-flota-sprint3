import type { TelemetryObserver } from './Observer.js';
import type { VehicleStatusDTO } from '../modules/monitoring/monitoring.service.js';


// rol Subject del Patron Observer
/**
 * Sujeto observable de telemetría (rol Subject del patrón Observer).
 *
 * Mantiene, por unidad, el conjunto de observadores suscritos. El productor (el simulador)
 * llama a {@link publish} una sola vez por tick y el bus notifica a todos los observadores
 * de esa unidad, sin que productor y consumidores se conozcan entre sí.
 */
export class TelemetryBus {
  private static instance: TelemetryBus | undefined;

  private readonly observers = new Map<string, Set<TelemetryObserver>>();

  // Singleton: Punto de acceso a la instancia compartida
  static get(): TelemetryBus {
    return (TelemetryBus.instance ??= new TelemetryBus());
  }

  // Suscribe un observador a una unidad. Devuelve una funcion para desuscribirlo
  subscribe(unitId: string, observer: TelemetryObserver): () => void {
    const set = this.observers.get(unitId) ?? new Set<TelemetryObserver>();
    set.add(observer);
    this.observers.set(unitId, set);
    return () => this.unsubscribe(unitId, observer);
  }

  // Desuscribe un observador de una unidad
  private unsubscribe(unitId: string, observer: TelemetryObserver): void {
    const set = this.observers.get(unitId);
    if (!set) return;
    set.delete(observer);
    if (set.size === 0) this.observers.delete(unitId);
  }

  // Notifica el nuevo estado a todos los observadores de la unidad.
  publish(unitId: string, status: VehicleStatusDTO): void {
    this.observers.get(unitId)?.forEach((observer) => observer.update(status));
  }

  // Revisa si hay observadores suscritos a una unidad
  hasObservers(unitId: string): boolean {
    return (this.observers.get(unitId)?.size ?? 0) > 0;
  }
}

// Objeto compartido por toda la aplicación.
export const telemetryBus: TelemetryBus = TelemetryBus.get();
