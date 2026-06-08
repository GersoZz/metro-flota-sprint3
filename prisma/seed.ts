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

  // Unidades monitoreadas
  const monitored = [
    { id: 'U-4022', plate: 'MON-4022', km: 158_000 },
    { id: 'U-208', plate: 'MON-0208', km: 96_500 },
  ];
  for (const m of monitored) {
    const data = {
      plate: m.plate,
      type: 'BusArticulado' as const,
      km: m.km,
      state: 'Operativo' as const,
      lastInspectionDate: parseDmy('15/02/2024'),
      consortiumId: consortiumId.get('Lima Vías Express')!,
      currentRouteCode: 'TR-B',
    };
    await prisma.vehicle.upsert({
      where: { id: m.id },
      update: data,
      create: { id: m.id, ...data },
    });
  }

  // 7) Telemetría
  const trbStops = await prisma.stop.findMany({
    where: { routeCode: 'TR-B', order: { in: [1, 2] } },
    orderBy: { order: 'asc' },
  });
  const stopByOrder = new Map(trbStops.map((s) => [s.order, s]));

  const statuses = [
    {
      id: 'seed-st-U-4022',
      vehicleId: 'U-4022',
      driverId: driverId.get('88492-C')!,
      speedKmh: 64,
      capacity: 160,
      passengers: Math.round(0.65 * 160),
      nextStopId: stopByOrder.get(1)?.id ?? null,
      lat: -12.015,
      lng: -77.051,
    },
    {
      id: 'seed-st-U-208',
      vehicleId: 'U-208',
      driverId: driverId.get('12345-A')!,
      speedKmh: 52,
      capacity: 120,
      passengers: 60,
      nextStopId: stopByOrder.get(2)?.id ?? null,
      lat: -12.0205,
      lng: -77.0538,
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
      routeCode: 'TR-B',
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
