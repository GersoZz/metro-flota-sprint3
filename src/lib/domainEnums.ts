export const vehicleTypeToDisplay = {
  BusArticulado: 'Bus Articulado',
  Alimentador: 'Alimentador',
} as const;

export const vehicleStateToDisplay = {
  Operativo: 'Operativo',
  EnTaller: 'En Taller',
  Alerta: 'Alerta',
  DadoDeBaja: 'Dado de Baja',
} as const;

export const fuelTypeToDisplay = {
  Diesel: 'Diesel',
  GNV: 'GNV',
  Electrico: 'Eléctrico',
} as const;

export const dayTypeToDisplay = {
  Laborable: 'Laborable',
  Sabado: 'Sábado',
  Domingo: 'Domingo',
} as const;

export const timeBandToDisplay = {
  PicoManana: 'Pico Mañana',
  PicoTarde: 'Pico Tarde',
  Valle: 'Valle',
  Baja: 'Baja',
} as const;

export const routeTypeToDisplay = {
  Troncal: 'Troncal',
  Expreso: 'Expreso',
  Alimentador: 'Alimentador',
} as const;

export const routeStateToDisplay = {
  Activa: 'Activa',
  EnRevision: 'En Revisión',
  Suspendida: 'Suspendida',
} as const;

function invert<K extends string, V extends string>(map: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<V, K>;
}

export const vehicleTypeFromDisplay = invert(vehicleTypeToDisplay);
// { Operativo: 'Operativo', 'En Taller': 'EnTaller', Alerta: 'Alerta' }
export const vehicleStateFromDisplay = invert(vehicleStateToDisplay);
export const routeTypeFromDisplay = invert(routeTypeToDisplay);
export const routeStateFromDisplay = invert(routeStateToDisplay);
export const fuelTypeFromDisplay = invert(fuelTypeToDisplay);
export const dayTypeFromDisplay = invert(dayTypeToDisplay);
export const timeBandFromDisplay = invert(timeBandToDisplay);

export const vehicleTypeDisplays = Object.values(vehicleTypeToDisplay);
// [ 'Operativo', 'En Taller', 'Alerta' ]
export const vehicleStateDisplays = Object.values(vehicleStateToDisplay);
export const routeTypeDisplays = Object.values(routeTypeToDisplay);
export const routeStateDisplays = Object.values(routeStateToDisplay);
export const fuelTypeDisplays = Object.values(fuelTypeToDisplay);
export const dayTypeDisplays = Object.values(dayTypeToDisplay);
export const timeBandDisplays = Object.values(timeBandToDisplay);

// Retorna el identificador interno cuyo display contiene `text` (case-insensitive)
// o `undefined` si ninguno coincide
export function matchEnumDisplay<K extends string>(
  map: Record<K, string>,
  text: string,
): K | undefined {
  const t = text.toLowerCase();
  const entry = (Object.entries(map) as [K, string][]).find(([, display]) =>
    display.toLowerCase().includes(t),
  );
  return entry?.[0];
}
