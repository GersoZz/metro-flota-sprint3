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

const consortiums = ['Lima Vías Express', 'Transvial Lima', 'Perú Masivo'];

const drivers = [
  { name: 'Roberto Salazar', licenseNumber: '88492-C' },
  { name: 'Juan Pérez', licenseNumber: '12345-A' },
  { name: 'Ana Torres', licenseNumber: '55678-B' },
  { name: 'Luis Ramírez', licenseNumber: '33456-D' },
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
  },
  {
    plate: 'B4C-129',
    id: 'ALI-802',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '89,450 km',
    state: 'En Taller',
    date: '24/10/2023',
  },
  {
    plate: 'C1P-882',
    id: 'ART-2015',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '210,050 km',
    state: 'Alerta',
    date: '05/06/2023',
  },
  {
    plate: 'D3K-504',
    id: 'ART-1187',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '98,120 km',
    state: 'Operativo',
    date: '02/02/2024',
  },
  {
    plate: 'E7H-219',
    id: 'ALI-913',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '76,880 km',
    state: 'Operativo',
    date: '19/01/2024',
  },
  {
    plate: 'F9M-640',
    id: 'ART-2231',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '182,400 km',
    state: 'En Taller',
    date: '11/11/2023',
  },
  {
    plate: 'G2B-071',
    id: 'ALI-445',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '54,300 km',
    state: 'Operativo',
    date: '27/02/2024',
  },
  {
    plate: 'H8L-389',
    id: 'ART-1808',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '165,700 km',
    state: 'Operativo',
    date: '08/03/2024',
  },
  {
    plate: 'I5Q-227',
    id: 'ALI-612',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '112,950 km',
    state: 'Alerta',
    date: '14/07/2023',
  },
  {
    plate: 'J1N-914',
    id: 'ART-1990',
    type: 'Bus Articulado',
    consortium: 'Lima Vías Express',
    km: '203,480 km',
    state: 'En Taller',
    date: '22/09/2023',
  },
  {
    plate: 'K6R-558',
    id: 'ALI-774',
    type: 'Alimentador',
    consortium: 'Perú Masivo',
    km: '68,200 km',
    state: 'Operativo',
    date: '05/03/2024',
  },
  {
    plate: 'L4S-083',
    id: 'ART-2077',
    type: 'Bus Articulado',
    consortium: 'Transvial Lima',
    km: '134,650 km',
    state: 'Operativo',
    date: '17/12/2023',
  },
  {
    plate: 'M2T-462',
    id: 'ALI-358',
    type: 'Alimentador',
    consortium: 'Lima Vías Express',
    km: '45,800 km',
    state: 'Operativo',
    date: '30/03/2024',
  },
  {
    plate: 'N7V-701',
    id: 'ART-1543',
    type: 'Bus Articulado',
    consortium: 'Perú Masivo',
    km: '221,900 km',
    state: 'Alerta',
    date: '10/05/2023',
  },
  {
    plate: 'O9W-135',
    id: 'ALI-290',
    type: 'Alimentador',
    consortium: 'Transvial Lima',
    km: '81,400 km',
    state: 'Operativo',
    date: '25/01/2024',
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
    const data = {
      plate: v.plate,
      type: vehicleType[v.type as keyof typeof vehicleType],
      km: parseKm(v.km),
      state: vehicleState[v.state as keyof typeof vehicleState],
      lastInspectionDate: parseDmy(v.date),
      consortiumId: consortiumId.get(v.consortium)!,
    };
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: data,
      create: { id: v.id, ...data },
    });
  }

  // Unidades monitoreadas (asignadas a las rutas reales del Metropolitano)
  const monitored = [
    { id: 'U-4022', plate: 'MON-4022', km: 158_000, routeCode: 'MET-A' },
    { id: 'U-208', plate: 'MON-0208', km: 96_500, routeCode: 'MET-B' },
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
  ];
  for (const a of alerts) {
    const { id, ...rest } = a;
    await prisma.alert.upsert({ where: { id }, update: rest, create: { id, ...rest } });
  }

  // Usuario admin
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@metroflota.gob.pe';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';
  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    },
  });

  const counts = {
    consortiums: await prisma.consortium.count(),
    drivers: await prisma.driver.count(),
    routes: await prisma.route.count(),
    stops: await prisma.stop.count(),
    vehicles: await prisma.vehicle.count(),
    statuses: await prisma.vehicleStatus.count(),
    alerts: await prisma.alert.count(),
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
