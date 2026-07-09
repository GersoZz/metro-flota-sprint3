// Logica pura de simulacion de escenarios de operacion (RF-10).
// No depende de prisma ni de express, solo aritmetica de teoria de colas simple.
// Todos los tiempos estan en minutos y las distancias en kilometros.

export interface ScenarioInput {
  lengthKm: number;
  avgSpeedKmh: number;
  buses: number;
  targetHeadwayMin?: number;
}

export interface ScenarioResult {
  cycleTimeMinutes: number;
  headwayMinutes: number;
  avgWaitMinutes: number;
  busesNeeded: number | null;
}

// Tiempo de vuelta completa de un bus recorriendo la ruta.
// Se asume que lengthKm ya representa el ciclo que hace el bus.
export function cycleTimeMinutes(lengthKm: number, avgSpeedKmh: number): number {
  if (avgSpeedKmh <= 0) {
    throw new Error('La velocidad promedio debe ser mayor que cero');
  }
  if (lengthKm < 0) {
    throw new Error('La longitud no puede ser negativa');
  }
  return (lengthKm / avgSpeedKmh) * 60;
}

// Intervalo entre buses consecutivos: tiempo de vuelta repartido entre los buses.
export function headwayMinutes(cycleTime: number, buses: number): number {
  if (buses <= 0) {
    throw new Error('La cantidad de buses debe ser mayor que cero');
  }
  return cycleTime / buses;
}

// Tiempo de espera promedio de un pasajero que llega al azar: la mitad del headway.
export function avgWaitMinutes(headway: number): number {
  return headway / 2;
}

// Buses necesarios para alcanzar un headway objetivo.
// Se redondea hacia arriba porque no se pueden usar fracciones de bus.
export function busesNeededForHeadway(cycleTime: number, targetHeadwayMin: number): number {
  if (targetHeadwayMin <= 0) {
    throw new Error('El headway objetivo debe ser mayor que cero');
  }
  return Math.ceil(cycleTime / targetHeadwayMin);
}

// Redondea a dos decimales para no arrastrar ruido de punto flotante en la respuesta.
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Calcula todas las metricas del escenario a partir de los datos de entrada.
export function simulateScenario(input: ScenarioInput): ScenarioResult {
  const cycle = cycleTimeMinutes(input.lengthKm, input.avgSpeedKmh);
  const headway = headwayMinutes(cycle, input.buses);
  const wait = avgWaitMinutes(headway);

  const busesNeeded =
    input.targetHeadwayMin !== undefined
      ? busesNeededForHeadway(cycle, input.targetHeadwayMin)
      : null;

  return {
    cycleTimeMinutes: round2(cycle),
    headwayMinutes: round2(headway),
    avgWaitMinutes: round2(wait),
    busesNeeded,
  };
}
