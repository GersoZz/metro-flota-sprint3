import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/modules/auth/password.js';

const vehicleType = {
  'Bus Articulado': 'BusArticulado',
  Alimentador: 'Alimentador',
} as const;

const vehicleState = {
  Operativo: 'Operativo',
  'En Taller': 'EnTaller',
  Alerta: 'Alerta',
  'Dado de Baja': 'DadoDeBaja',
} as const;

const routeState = {
  Activa: 'Activa',
  'En Revisión': 'EnRevision',
  Suspendida: 'Suspendida',
} as const;

const parseKm = (s: string): number => Number(s.replace(/[^\d]/g, ''));
const parseLength = (s: string): number => parseFloat(s);
const parseFreq = (s: string): number => parseInt(s, 10);
// "dd/mm/yyyy" -> Date (UTC, sin hora)
const parseDmy = (s: string): Date => {
  const [d, m, y] = s.split('/').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
};
const minutesAgo = (n: number): Date => new Date(Date.now() - n * 60_000);
const daysAgo = (n: number): Date => new Date(Date.now() - n * 86_400_000);
const daysFromNow = (n: number): Date => new Date(Date.now() + n * 86_400_000);

// Combustible por consorcio (RF-01): cada operador estandarizó su flota.
const fuelByConsortium = {
  'Lima Vías Express': 'Diesel',
  'Transvial Lima': 'GNV',
  'Perú Masivo': 'Electrico',
} as const;

const consortiums = ['Lima Vías Express', 'Transvial Lima', 'Perú Masivo'];

const drivers = [
  { name: 'Roberto Salazar', licenseNumber: '88492-C' },
  { name: 'Juan Pérez', licenseNumber: '12345-A' },
  { name: 'Ana Torres', licenseNumber: '55678-B' },
  { name: 'Luis Ramírez', licenseNumber: '33456-D' },
  { name: 'Carla Mendoza', licenseNumber: '77213-E' },
  { name: 'Miguel Ángel Rojas', licenseNumber: '90341-F' },
  { name: 'Fiorella Castillo', licenseNumber: '24567-G' },
  { name: 'Jorge Huamán', licenseNumber: '61829-H' },
  { name: 'Patricia Vega', licenseNumber: '38904-I' },
  { name: 'Diego Flores', licenseNumber: '15702-J' },
];

const vehicleRows = [
  {
    plate: 'A2F-741',
    id: 'ART-1042',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '145,230 km',
    state: 'Operativo',
    date: '12/10/2023',
    routeCode: 'TR-A',
  },
  {
    plate: 'B4C-129',
    id: 'ALI-802',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '89,450 km',
    state: 'En Taller',
    date: '24/10/2023',
    routeCode: 'AL-12',
  },
  {
    plate: 'C1P-882',
    id: 'ART-2015',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '210,050 km',
    state: 'Alerta',
    date: '05/06/2023',
    routeCode: 'TR-B',
  },
  {
    plate: 'D3K-504',
    id: 'ART-1187',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '98,120 km',
    state: 'Operativo',
    date: '02/02/2024',
    routeCode: 'TR-A',
  },
  {
    plate: 'E7H-219',
    id: 'ALI-913',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '76,880 km',
    state: 'Operativo',
    date: '19/01/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'F9M-640',
    id: 'ART-2231',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '182,400 km',
    state: 'En Taller',
    date: '11/11/2023',
    routeCode: 'TR-C',
  },
  {
    plate: 'G2B-071',
    id: 'ALI-445',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '54,300 km',
    state: 'Operativo',
    date: '27/02/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'H8L-389',
    id: 'ART-1808',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '165,700 km',
    state: 'Operativo',
    date: '08/03/2024',
    routeCode: 'EX-1',
  },
  {
    plate: 'I5Q-227',
    id: 'ALI-612',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '112,950 km',
    state: 'Alerta',
    date: '14/07/2023',
    routeCode: 'AL-18',
  },
  {
    plate: 'J1N-914',
    id: 'ART-1990',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '203,480 km',
    state: 'En Taller',
    date: '22/09/2023',
    routeCode: 'EX-4',
  },
  {
    plate: 'K6R-558',
    id: 'ALI-774',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '68,200 km',
    state: 'Operativo',
    date: '05/03/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'L4S-083',
    id: 'ART-2077',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '134,650 km',
    state: 'Operativo',
    date: '17/12/2023',
    routeCode: 'TR-B',
  },
  {
    plate: 'M2T-462',
    id: 'ALI-358',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '45,800 km',
    state: 'Operativo',
    date: '30/03/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'N7V-701',
    id: 'ART-1543',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '221,900 km',
    state: 'Alerta',
    date: '10/05/2023',
    routeCode: 'EX-1',
  },
  {
    plate: 'O9W-135',
    id: 'ALI-290',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '81,400 km',
    state: 'Operativo',
    date: '25/01/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'P3X-816',
    id: 'ART-2340',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '192,300 km',
    state: 'Operativo',
    date: '14/04/2024',
    routeCode: 'TR-A',
  },
  {
    plate: 'Q8Y-457',
    id: 'ALI-529',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '39,650 km',
    state: 'Operativo',
    date: '02/05/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'R5Z-993',
    id: 'ART-2456',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '175,020 km',
    state: 'En Taller',
    date: '19/03/2024',
    routeCode: 'TR-B',
  },
  {
    plate: 'S2A-620',
    id: 'ALI-681',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '58,470 km',
    state: 'Alerta',
    date: '30/01/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'T6B-348',
    id: 'ART-2589',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '201,150 km',
    state: 'Operativo',
    date: '07/06/2024',
    routeCode: 'TR-C',
  },
  {
    plate: 'U1C-772',
    id: 'ALI-736',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '64,900 km',
    state: 'Operativo',
    date: '21/02/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'V4D-105',
    id: 'ART-2601',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '188,730 km',
    state: 'En Taller',
    date: '13/12/2023',
    routeCode: 'TR-C',
  },
  {
    plate: 'W7E-289',
    id: 'ALI-812',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '47,220 km',
    state: 'Operativo',
    date: '09/05/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'X2F-534',
    id: 'ART-2718',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '215,600 km',
    state: 'Alerta',
    date: '28/08/2023',
    routeCode: 'EX-1',
  },
  {
    plate: 'Y9G-861',
    id: 'ALI-903',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '71,340 km',
    state: 'Operativo',
    date: '16/04/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'Z5H-407',
    id: 'ART-2833',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '159,880 km',
    state: 'Operativo',
    date: '04/07/2024',
    routeCode: 'EX-4',
  },
  {
    plate: 'A8J-216',
    id: 'ALI-964',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '33,510 km',
    state: 'Operativo',
    date: '22/06/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'B3K-670',
    id: 'ART-2945',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '197,240 km',
    state: 'En Taller',
    date: '11/01/2024',
    routeCode: 'TR-A',
  },
  {
    plate: 'C7L-390',
    id: 'ART-3010',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '142,880 km',
    state: 'Operativo',
    date: '05/08/2024',
    routeCode: 'TR-B',
  },
  {
    plate: 'D2M-517',
    id: 'ALI-1021',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '28,340 km',
    state: 'Operativo',
    date: '19/09/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'E9N-742',
    id: 'ART-3128',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '167,510 km',
    state: 'Operativo',
    date: '02/07/2024',
    routeCode: 'TR-C',
  },
  {
    plate: 'F4P-268',
    id: 'ALI-1145',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '51,690 km',
    state: 'En Taller',
    date: '14/10/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'G8Q-903',
    id: 'ART-3247',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '183,220 km',
    state: 'Operativo',
    date: '27/06/2024',
    routeCode: 'TR-A',
  },
  {
    plate: 'H1R-456',
    id: 'ALI-1289',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '19,870 km',
    state: 'Operativo',
    date: '08/11/2024',
    routeCode: 'AL-18',
  },
  {
    plate: 'I6S-834',
    id: 'ART-3356',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '204,600 km',
    state: 'Alerta',
    date: '30/05/2024',
    routeCode: 'TR-B',
  },
  {
    plate: 'J3T-621',
    id: 'ALI-1372',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '43,120 km',
    state: 'Operativo',
    date: '22/10/2024',
    routeCode: 'AL-12',
  },
  {
    plate: 'K7U-158',
    id: 'ART-3489',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '156,340 km',
    state: 'Operativo',
    date: '15/09/2024',
    routeCode: 'EX-4',
  },
  {
    plate: 'L2V-970',
    id: 'ALI-1503',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '35,780 km',
    state: 'Operativo',
    date: '01/12/2024',
    routeCode: 'AL-18',
  },
];

const routeRows = [
  {
    code: 'TR-A',
    name: 'Ruta A — Naranjal ↔ Matellini',
    type: 'Troncal',
    stops: 38,
    length: '33.2 km',
    frequency: '3 min',
    buses: 62,
    state: 'Activa',
  },
  {
    code: 'TR-B',
    name: 'Ruta B — Naranjal ↔ Ramón Castilla',
    type: 'Troncal',
    stops: 26,
    length: '21.5 km',
    frequency: '4 min',
    buses: 44,
    state: 'Activa',
  },
  {
    code: 'TR-C',
    name: 'Ruta C — Izaguirre ↔ Estadio Nacional',
    type: 'Troncal',
    stops: 22,
    length: '18.9 km',
    frequency: '5 min',
    buses: 36,
    state: 'En Revisión',
  },
  {
    code: 'EX-1',
    name: 'Expreso 1 — Naranjal ↔ Central',
    type: 'Expreso',
    stops: 9,
    length: '16.0 km',
    frequency: '6 min',
    buses: 18,
    state: 'Activa',
  },
  {
    code: 'EX-4',
    name: 'Expreso 4 — Matellini ↔ Javier Prado',
    type: 'Expreso',
    stops: 7,
    length: '14.2 km',
    frequency: '7 min',
    buses: 14,
    state: 'Activa',
  },
  {
    code: 'AL-12',
    name: 'Alimentador 12 — Naranjal ↔ Puente Piedra',
    type: 'Alimentador',
    stops: 24,
    length: '11.8 km',
    frequency: '8 min',
    buses: 20,
    state: 'Activa',
  },
  {
    code: 'AL-18',
    name: 'Alimentador 18 — Matellini ↔ San Juan de Miraflores',
    type: 'Alimentador',
    stops: 19,
    length: '9.4 km',
    frequency: '9 min',
    buses: 16,
    state: 'Suspendida',
  },
];

const namedStops: Record<string, { name: string; lat: number; lng: number }> = {
  'TR-B:1': { name: 'Estación Tomás Valle', lat: -12.0152, lng: -77.0512 },
  'TR-B:2': { name: 'Estación Honorio Delgado', lat: -12.0205, lng: -77.0538 },
  'TR-B:3': { name: 'Estación UNI', lat: -12.0246, lng: -77.0556 },
};

type RealStation = { orden: number; nombre: string; lat: number; lon: number };
type RealRoute = { code: string; ruta: string; nombre: string; recorrido: string; estaciones: RealStation[] };

const realRoutes: RealRoute[] = [
  {
    code: 'MET-A',
    ruta: 'A',
    nombre: 'Ruta A',
    recorrido: 'Terminal Naranjal - Estación Central',
    estaciones: [
      { orden: 1, nombre: 'Terminal Naranjal', lat: -11.98264, lon: -77.0587 },
      { orden: 2, nombre: 'Izaguirre', lat: -11.98961, lon: -77.05704 },
      { orden: 3, nombre: 'Pacífico', lat: -11.99476, lon: -77.05607 },
      { orden: 4, nombre: 'Independencia', lat: -11.9985, lon: -77.05523 },
      { orden: 5, nombre: 'Los Jazmines', lat: -12.0018, lon: -77.0548 },
      { orden: 6, nombre: 'Tomás Valle', lat: -12.00615, lon: -77.05405 },
      { orden: 7, nombre: 'El Milagro', lat: -12.0117, lon: -77.05286 },
      { orden: 8, nombre: 'Honorio Delgado', lat: -12.01825, lon: -77.0516 },
      { orden: 9, nombre: 'UNI', lat: -12.0242, lon: -77.04887 },
      { orden: 10, nombre: 'Parque del Trabajo', lat: -12.0304, lon: -77.04434 },
      { orden: 11, nombre: 'Caquetá', lat: -12.03636, lon: -77.04366 },
      { orden: 12, nombre: 'Ramón Castilla', lat: -12.04398, lon: -77.04148 },
      { orden: 13, nombre: 'Tacna', lat: -12.04656, lon: -77.03714 },
      { orden: 14, nombre: 'Jirón de la Unión', lat: -12.04948, lon: -77.03262 },
      { orden: 15, nombre: 'Colmena', lat: -12.0524, lon: -77.03291 },
      { orden: 16, nombre: 'Estación Central', lat: -12.0577, lon: -77.03595 },
    ],
  },
  {
    code: 'MET-B',
    ruta: 'B',
    nombre: 'Ruta B',
    recorrido: 'Terminal Chimpu Ocllo - Estación Central',
    estaciones: [
      { orden: 1, nombre: 'Terminal Chimpu Ocllo', lat: -11.89639, lon: -77.03741 },
      { orden: 2, nombre: 'Los Incas', lat: -11.91545, lon: -77.04805 },
      { orden: 3, nombre: 'Andrés Belaunde', lat: -11.93505, lon: -77.0564 },
      { orden: 4, nombre: '22 de Agosto', lat: -11.94665, lon: -77.06059 },
      { orden: 5, nombre: 'Las Vegas', lat: -11.95489, lon: -77.05992 },
      { orden: 6, nombre: 'Universidad', lat: -11.96279, lon: -77.06233 },
      { orden: 7, nombre: 'Terminal Naranjal', lat: -11.98264, lon: -77.0587 },
      { orden: 8, nombre: 'Izaguirre', lat: -11.98961, lon: -77.05704 },
      { orden: 9, nombre: 'Pacífico', lat: -11.99476, lon: -77.05607 },
      { orden: 10, nombre: 'Independencia', lat: -11.9985, lon: -77.05523 },
      { orden: 11, nombre: 'Los Jazmines', lat: -12.0018, lon: -77.0548 },
      { orden: 12, nombre: 'Tomás Valle', lat: -12.00615, lon: -77.05405 },
      { orden: 13, nombre: 'El Milagro', lat: -12.0117, lon: -77.05286 },
      { orden: 14, nombre: 'Honorio Delgado', lat: -12.01825, lon: -77.0516 },
      { orden: 15, nombre: 'UNI', lat: -12.0242, lon: -77.04887 },
      { orden: 16, nombre: 'Parque del Trabajo', lat: -12.0304, lon: -77.04434 },
      { orden: 17, nombre: 'Caquetá', lat: -12.03636, lon: -77.04366 },
      { orden: 18, nombre: 'Dos de Mayo', lat: -12.04744, lon: -77.04267 },
      { orden: 19, nombre: 'Quilca', lat: -12.05192, lon: -77.04228 },
      { orden: 20, nombre: 'España', lat: -12.05777, lon: -77.04173 },
      { orden: 21, nombre: 'Estación Central', lat: -12.0577, lon: -77.03595 },
    ],
  },
];

const haversineKm = (a: RealStation, b: RealStation): number => {
  const R = 6371;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const routeLengthKm = (st: RealStation[]): number => {
  let total = 0;
  for (let i = 1; i < st.length; i++) total += haversineKm(st[i - 1]!, st[i]!);
  return Math.round(total * 10) / 10;
};

async function main(): Promise<void> {
  // Consorcios
  const consortiumId = new Map<string, string>();
  for (const name of consortiums) {
    const c = await prisma.consortium.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    consortiumId.set(name, c.id);
  }

  // Conductores
  const driverId = new Map<string, string>();
  for (const d of drivers) {
    const created = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: { name: d.name },
      create: d,
    });
    driverId.set(d.licenseNumber, created.id);
  }

  // Rutas
  for (const r of routeRows) {
    await prisma.route.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        type: r.type as 'Troncal' | 'Expreso' | 'Alimentador',
        lengthKm: parseLength(r.length),
        frequencyMinutes: parseFreq(r.frequency),
        busesAssigned: r.buses,
        state: routeState[r.state as keyof typeof routeState],
      },
      create: {
        code: r.code,
        name: r.name,
        type: r.type as 'Troncal' | 'Expreso' | 'Alimentador',
        lengthKm: parseLength(r.length),
        frequencyMinutes: parseFreq(r.frequency),
        busesAssigned: r.buses,
        state: routeState[r.state as keyof typeof routeState],
      },
    });

    // Paradas ordenadas
    for (let order = 1; order <= r.stops; order++) {
      const named = namedStops[`${r.code}:${order}`];
      await prisma.stop.upsert({
        where: { routeCode_order: { routeCode: r.code, order } },
        update: named
          ? { name: named.name, lat: named.lat, lng: named.lng }
          : { name: `Estación ${r.code} ${order}` },
        create: {
          routeCode: r.code,
          order,
          name: named ? named.name : `Estación ${r.code} ${order}`,
          lat: named?.lat ?? null,
          lng: named?.lng ?? null,
        },
      });
    }
  }

  // Rutas reales del Metropolitano 
  for (const rr of realRoutes) {
    const data = {
      name: `${rr.nombre} — ${rr.recorrido}`,
      type: 'Troncal' as const,
      lengthKm: routeLengthKm(rr.estaciones),
      frequencyMinutes: 5,
      busesAssigned: rr.estaciones.length * 3,
      state: 'Activa' as const,
    };
    await prisma.route.upsert({
      where: { code: rr.code },
      update: data,
      create: { code: rr.code, ...data },
    });

    for (const st of rr.estaciones) {
      await prisma.stop.upsert({
        where: { routeCode_order: { routeCode: rr.code, order: st.orden } },
        update: { name: st.nombre, lat: st.lat, lng: st.lon },
        create: {
          routeCode: rr.code,
          order: st.orden,
          name: st.nombre,
          lat: st.lat,
          lng: st.lon,
        },
      });
    }
  }

  // Vehículos
  for (const v of vehicleRows) {
    const type = vehicleType[v.type as keyof typeof vehicleType];
    // capacity/year derivados del tipo y del número de unidad para no listarlos a mano
    const unitNumber = Number(v.id.replace(/\D/g, ''));
    const data = {
      plate: v.plate,
      type,
      km: parseKm(v.km),
      state: vehicleState[v.state as keyof typeof vehicleState],
      lastInspectionDate: parseDmy(v.date),
      consortiumId: consortiumId.get(v.consortium)!,
      currentRouteCode: v.routeCode,
      capacity: type === 'BusArticulado' ? 160 : 80,
      year: 2015 + (unitNumber % 10),
      fuelType: fuelByConsortium[v.consortium as keyof typeof fuelByConsortium],
    };
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: data,
      create: { id: v.id, ...data },
    });
  }

  // Unidades dadas de baja (RF-05): fuera de servicio, sin ruta asignada
  const retired = [
    { id: 'ART-0901', plate: 'AAB-901', km: 412_300, date: '03/03/2019', year: 2009 },
    { id: 'ALI-0117', plate: 'AAC-117', km: 355_940, date: '18/08/2020', year: 2011 },
  ];
  for (const r of retired) {
    const data = {
      plate: r.plate,
      type: r.id.startsWith('ART') ? ('BusArticulado' as const) : ('Alimentador' as const),
      km: r.km,
      state: 'DadoDeBaja' as const,
      lastInspectionDate: parseDmy(r.date),
      consortiumId: consortiumId.get('Lima Vías Express')!,
      currentRouteCode: null,
      capacity: r.id.startsWith('ART') ? 160 : 80,
      year: r.year,
      fuelType: 'Diesel' as const,
    };
    await prisma.vehicle.upsert({
      where: { id: r.id },
      update: data,
      create: { id: r.id, ...data },
    });
  }

  // Unidades monitoreadas (asignadas a las rutas reales del Metropolitano)
  const monitored = [
    { id: 'U-4022', plate: 'MON-4022', km: 158_000, routeCode: 'MET-A' },
    { id: 'U-208', plate: 'MON-0208', km: 96_500, routeCode: 'MET-B' },
    { id: 'U-3311', plate: 'MON-3311', km: 121_400, routeCode: 'MET-A' },
    { id: 'U-1587', plate: 'MON-1587', km: 84_900, routeCode: 'MET-B' },
  ];
  for (const m of monitored) {
    const data = {
      plate: m.plate,
      type: 'BusArticulado' as const,
      km: m.km,
      state: 'Operativo' as const,
      lastInspectionDate: parseDmy('15/02/2024'),
      consortiumId: consortiumId.get('Lima Vías Express')!,
      currentRouteCode: m.routeCode,
      capacity: 160,
      year: 2021,
      fuelType: 'Diesel' as const,
    };
    await prisma.vehicle.upsert({
      where: { id: m.id },
      update: data,
      create: { id: m.id, ...data },
    });
  }

  // 7) Telemetría
  const stopFor = async (routeCode: string, order: number) =>
    prisma.stop.findUnique({ where: { routeCode_order: { routeCode, order } } });

  const metaPos = await stopFor('MET-A', 2); // Izaguirre
  const metaNext = await stopFor('MET-A', 3); // Pacífico
  const metbPos = await stopFor('MET-B', 2); // Los Incas
  const metbNext = await stopFor('MET-B', 3); // Andrés Belaunde
  const meta2Pos = await stopFor('MET-A', 9); // UNI
  const meta2Next = await stopFor('MET-A', 10); // Parque del Trabajo
  const metb2Pos = await stopFor('MET-B', 12); // Tomás Valle
  const metb2Next = await stopFor('MET-B', 13); // El Milagro

  const statuses = [
    {
      id: 'seed-st-U-4022',
      vehicleId: 'U-4022',
      driverId: driverId.get('88492-C')!,
      speedKmh: 64,
      capacity: 160,
      passengers: Math.round(0.65 * 160),
      nextStopId: metaNext?.id ?? null,
      lat: Number(metaPos?.lat ?? -11.98961),
      lng: Number(metaPos?.lng ?? -77.05704),
    },
    {
      id: 'seed-st-U-208',
      vehicleId: 'U-208',
      driverId: driverId.get('12345-A')!,
      speedKmh: 52,
      capacity: 120,
      passengers: 60,
      nextStopId: metbNext?.id ?? null,
      lat: Number(metbPos?.lat ?? -11.91545),
      lng: Number(metbPos?.lng ?? -77.04805),
    },
    {
      id: 'seed-st-U-3311',
      vehicleId: 'U-3311',
      driverId: driverId.get('77213-E')!,
      speedKmh: 38,
      capacity: 160,
      passengers: Math.round(0.4 * 160),
      nextStopId: meta2Next?.id ?? null,
      lat: Number(meta2Pos?.lat ?? -12.0242),
      lng: Number(meta2Pos?.lng ?? -77.04887),
    },
    {
      id: 'seed-st-U-1587',
      vehicleId: 'U-1587',
      driverId: driverId.get('90341-F')!,
      speedKmh: 0,
      capacity: 120,
      passengers: Math.round(0.8 * 120),
      nextStopId: metb2Next?.id ?? null,
      lat: Number(metb2Pos?.lat ?? -12.00615),
      lng: Number(metb2Pos?.lng ?? -77.05405),
    },
  ];
  for (const s of statuses) {
    const { id, ...rest } = s;
    await prisma.vehicleStatus.upsert({ where: { id }, update: rest, create: { id, ...rest } });
  }

  // Alertas
  const alerts = [
    {
      id: 'seed-alert-1',
      title: 'Falla Motor - Bus 4022',
      text: 'Ruta troncal Sur. Detenido en Estación Central.',
      tone: 'danger' as const,
      vehicleId: 'U-4022',
      routeCode: null,
      createdAt: minutesAgo(12),
    },
    {
      id: 'seed-alert-2',
      title: 'Desvío Ruta B',
      text: 'Congestión severa en Av. Principal. Retraso est. 15 min.',
      tone: 'warning' as const,
      vehicleId: null,
      routeCode: 'MET-B',
      createdAt: minutesAgo(28),
    },
    {
      id: 'seed-alert-3',
      title: 'Pérdida señal GPS',
      text: 'Unidad 1055 no reporta posición hace 5 minutos.',
      tone: 'danger' as const,
      vehicleId: null,
      routeCode: null,
      createdAt: minutesAgo(45),
    },
    {
      id: 'seed-alert-4',
      title: 'Mantenimiento programado',
      text: 'Unidad ART-2456 ingresó a taller por mantenimiento preventivo.',
      tone: 'warning' as const,
      vehicleId: 'ART-2456',
      routeCode: null,
      createdAt: minutesAgo(60),
      acknowledgedAt: minutesAgo(50),
    },
    {
      id: 'seed-alert-5',
      title: 'Sobreocupación',
      text: 'Unidad U-208 supera el 95% de su capacidad en hora punta.',
      tone: 'warning' as const,
      vehicleId: 'U-208',
      routeCode: 'MET-B',
      createdAt: minutesAgo(20),
    },
    {
      id: 'seed-alert-6',
      title: 'Falla de frenos',
      text: 'Unidad ART-2601 reporta alerta de freno de disco.',
      tone: 'danger' as const,
      vehicleId: 'ART-2601',
      routeCode: null,
      createdAt: minutesAgo(90),
      acknowledgedAt: minutesAgo(70),
    },
    {
      id: 'seed-alert-7',
      title: 'Congestión vial',
      text: 'Tráfico intenso en Ruta B altura Ramón Castilla, retraso est. 10 min.',
      tone: 'warning' as const,
      vehicleId: null,
      routeCode: 'TR-B',
      createdAt: minutesAgo(8),
    },
    {
      id: 'seed-alert-8',
      title: 'Neumático dañado',
      text: 'Unidad X2F-534 reporta pinchazo, requiere asistencia.',
      tone: 'danger' as const,
      vehicleId: 'ART-2718',
      routeCode: null,
      createdAt: minutesAgo(35),
    },
    {
      id: 'seed-alert-9',
      title: 'Revisión completada',
      text: 'Unidad ALI-736 concluyó revisión técnica sin observaciones.',
      tone: 'warning' as const,
      vehicleId: 'ALI-736',
      routeCode: null,
      createdAt: minutesAgo(120),
      acknowledgedAt: minutesAgo(100),
    },
  ];
  for (const a of alerts) {
    const { id, ...rest } = a;
    await prisma.alert.upsert({
      where: { id },
      update: { ...rest, acknowledgedAt: rest.acknowledgedAt ?? null },
      create: { id, ...rest },
    });
  }

  // Mantenimientos (RF-17 a RF-21)
  // Incluye casos que disparan la alerta de umbral (RF-18: a <=5000 km o <=7 días)
  // y fallas repetidas para el reporte de recurrentes (RF-21).
  const maintenances = [
    {
      // Cerca por km: ART-1042 tiene 145,230 km y el umbral es 148,000 -> genera alerta
      id: 'seed-mnt-1',
      vehicleId: 'ART-1042',
      type: 'Preventivo' as const,
      status: 'Programado' as const,
      description: 'Cambio de aceite y filtros por kilometraje',
      thresholdKm: 148_000,
    },
    {
      // Cerca por fecha: programado a 3 días -> genera alerta
      id: 'seed-mnt-2',
      vehicleId: 'U-4022',
      type: 'Preventivo' as const,
      status: 'Programado' as const,
      description: 'Revisión técnica semestral',
      scheduledDate: daysFromNow(3),
    },
    {
      // Lejos por km: no genera alerta (caso de control)
      id: 'seed-mnt-3',
      vehicleId: 'ART-3489',
      type: 'Preventivo' as const,
      status: 'Programado' as const,
      description: 'Mantenimiento mayor de motor',
      thresholdKm: 175_000,
    },
    {
      id: 'seed-mnt-4',
      vehicleId: 'ART-2456',
      type: 'Correctivo' as const,
      status: 'EnCurso' as const,
      description: 'Reparación de caja de cambios',
      components: 'Caja de cambios, embrague',
      technician: 'Taller Central - E. Quispe',
    },
    {
      // Coincide con seed-alert-6 (falla de frenos de ART-2601)
      id: 'seed-mnt-5',
      vehicleId: 'ART-2601',
      type: 'Correctivo' as const,
      status: 'EnCurso' as const,
      description: 'Cambio de discos y pastillas de freno',
      components: 'Discos de freno, pastillas',
      costEstimate: 3800,
      technician: 'Taller Norte - R. Paredes',
    },
    {
      // Completado con datos de ejecución (RF-19); coincide con seed-alert-9
      id: 'seed-mnt-6',
      vehicleId: 'ALI-736',
      type: 'Preventivo' as const,
      status: 'Completado' as const,
      description: 'Revisión técnica anual',
      scheduledDate: daysAgo(12),
      executedDate: daysAgo(10),
      components: 'Filtros, correas, luces',
      costEstimate: 1250.5,
      hours: 6.5,
      technician: 'Taller Central - M. Soto',
    },
    {
      // Falla recurrente 1/2: misma descripción en el mismo vehículo (RF-21)
      id: 'seed-mnt-7',
      vehicleId: 'ART-2015',
      type: 'Correctivo' as const,
      status: 'Completado' as const,
      description: 'Falla en sistema eléctrico',
      executedDate: daysAgo(45),
      components: 'Alternador',
      costEstimate: 2100,
      hours: 8,
      technician: 'Taller Sur - J. Medina',
    },
    {
      // Falla recurrente 2/2
      id: 'seed-mnt-8',
      vehicleId: 'ART-2015',
      type: 'Correctivo' as const,
      status: 'Completado' as const,
      description: 'Falla en sistema eléctrico',
      executedDate: daysAgo(6),
      components: 'Batería, cableado de tablero',
      costEstimate: 1650,
      hours: 5,
      technician: 'Taller Sur - J. Medina',
    },
    {
      id: 'seed-mnt-9',
      vehicleId: 'ALI-802',
      type: 'Correctivo' as const,
      status: 'EnCurso' as const,
      description: 'Reparación de suspensión trasera',
      components: 'Amortiguadores, bujes',
      technician: 'Taller Norte - R. Paredes',
    },
  ];
  for (const m of maintenances) {
    const { id, ...rest } = m;
    await prisma.maintenance.upsert({ where: { id }, update: rest, create: { id, ...rest } });
  }

  // Franjas de frecuencia por ruta (RF-07)
  const bands = [
    { dayType: 'Laborable' as const, timeBand: 'PicoManana' as const, factor: 1 },
    { dayType: 'Laborable' as const, timeBand: 'Valle' as const, factor: 2 },
    { dayType: 'Laborable' as const, timeBand: 'PicoTarde' as const, factor: 1 },
    { dayType: 'Laborable' as const, timeBand: 'Baja' as const, factor: 3 },
    { dayType: 'Sabado' as const, timeBand: 'Valle' as const, factor: 2 },
    { dayType: 'Domingo' as const, timeBand: 'Valle' as const, factor: 3 },
  ];
  const bandRoutes = ['TR-A', 'TR-B', 'MET-A', 'AL-12'];
  for (const routeCode of bandRoutes) {
    const base = routeRows.find((r) => r.code === routeCode)
      ? parseFreq(routeRows.find((r) => r.code === routeCode)!.frequency)
      : 5;
    for (const b of bands) {
      const intervalMinutes = base * b.factor;
      await prisma.frequencyBand.upsert({
        where: {
          routeCode_dayType_timeBand: { routeCode, dayType: b.dayType, timeBand: b.timeBand },
        },
        update: { intervalMinutes },
        create: { routeCode, dayType: b.dayType, timeBand: b.timeBand, intervalMinutes },
      });
    }
  }

  // Historial de versiones (RF-11): TR-C ya pasó por una edición
  await prisma.routeVersion.upsert({
    where: { routeCode_version: { routeCode: 'TR-C', version: 1 } },
    update: {},
    create: {
      routeCode: 'TR-C',
      version: 1,
      name: 'Ruta C — Izaguirre ↔ Plaza de Flores',
      type: 'Troncal',
      lengthKm: 17.4,
      frequencyMinutes: 6,
      state: 'Activa',
    },
  });

  // Usuarios (uno por rol, + el admin configurable por env)
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@metroflota.gob.pe';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';

  const seedUsers = [
    { name: 'Administrador', email: adminEmail, password: adminPassword, role: 'admin' as const },
    {
      name: 'Operador Base',
      email: 'operador@metroflota.gob.pe',
      password: 'operador1234',
      role: 'operador' as const,
    },
    {
      name: 'Supervisor Base',
      email: 'supervisor@metroflota.gob.pe',
      password: 'supervisor1234',
      role: 'supervisor' as const,
    },
    {
      name: 'Planificador Base',
      email: 'planificador@metroflota.gob.pe',
      password: 'planificador1234',
      role: 'planificador' as const,
    },
    {
      name: 'Jefe de Mantenimiento',
      email: 'mantenimiento@metroflota.gob.pe',
      password: 'mantenimiento1234',
      role: 'jefe_mantenimiento' as const,
    },
    {
      name: 'Directivo Base',
      email: 'directivo@metroflota.gob.pe',
      password: 'directivo1234',
      role: 'directivo' as const,
    },
  ];
  const userId = new Map<string, string>();
  for (const u of seedUsers) {
    const passwordHash = await hashPassword(u.password);
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
    userId.set(u.email, created.id);
  }

  // Registros de auditoría de ejemplo (RF-29); el resto los genera el middleware
  const auditRows = [
    {
      id: 'seed-audit-1',
      action: 'CREATE',
      entity: 'maintenance',
      entityId: 'seed-mnt-1',
      detail: 'POST /api/v1/maintenance',
      userId: userId.get('mantenimiento@metroflota.gob.pe')!,
      createdAt: daysAgo(2),
    },
    {
      id: 'seed-audit-2',
      action: 'UPDATE',
      entity: 'routes',
      entityId: 'TR-C',
      detail: 'PATCH /api/v1/routes/TR-C',
      userId: userId.get('planificador@metroflota.gob.pe')!,
      createdAt: daysAgo(1),
    },
    {
      id: 'seed-audit-3',
      action: 'UPDATE',
      entity: 'alerts',
      entityId: 'seed-alert-4',
      detail: 'PATCH /api/v1/alerts/seed-alert-4/acknowledge',
      userId: userId.get('supervisor@metroflota.gob.pe')!,
      createdAt: minutesAgo(50),
    },
  ];
  for (const a of auditRows) {
    const { id, ...rest } = a;
    await prisma.auditLog.upsert({ where: { id }, update: rest, create: { id, ...rest } });
  }

  const counts = {
    consortiums: await prisma.consortium.count(),
    drivers: await prisma.driver.count(),
    routes: await prisma.route.count(),
    stops: await prisma.stop.count(),
    vehicles: await prisma.vehicle.count(),
    statuses: await prisma.vehicleStatus.count(),
    alerts: await prisma.alert.count(),
    maintenances: await prisma.maintenance.count(),
    frequencyBands: await prisma.frequencyBand.count(),
    routeVersions: await prisma.routeVersion.count(),
    auditLogs: await prisma.auditLog.count(),
    users: await prisma.user.count(),
  };
  console.log('Seed completado:', counts);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error('Seed falló:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
