import { describe, expect, it } from 'vitest';
import {
  buildCsv,
  escapeCsvCell,
  toCsvRow,
  dailyReportToCsv,
  monthlyReportToCsv,
  recurringFailuresToCsv,
} from '../src/modules/reports/reports.csv.js';
import {
  countFailures,
  splitComponents,
  dayRange,
  monthRange,
} from '../src/modules/reports/reports.helpers.js';

describe('CSV helpers (RF-26)', () => {
  it('deja los valores simples sin comillas', () => {
    expect(escapeCsvCell('hola')).toBe('hola');
    expect(escapeCsvCell(42)).toBe('42');
  });

  it('convierte null y undefined en cadena vacia', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('envuelve en comillas los valores con coma, comilla o salto de linea', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('dice "hola"')).toBe('"dice ""hola"""');
    expect(escapeCsvCell('linea1\nlinea2')).toBe('"linea1\nlinea2"');
  });

  it('arma una fila separada por comas', () => {
    expect(toCsvRow(['a', 1, null])).toBe('a,1,');
  });

  it('arma un csv con cabecera y filas separado por CRLF', () => {
    const csv = buildCsv(['x', 'y'], [[1, 2], [3, 4]]);
    expect(csv).toBe('x,y\r\n1,2\r\n3,4');
  });
});

describe('countFailures (RF-21)', () => {
  it('cuenta ignorando mayusculas y espacios', () => {
    const result = countFailures(['Freno', 'freno ', ' FRENO', 'Motor']);
    expect(result).toEqual([
      { failure: 'Freno', count: 3 },
      { failure: 'Motor', count: 1 },
    ]);
  });

  it('ignora nulos y cadenas vacias', () => {
    expect(countFailures([null, '', '  ', 'Motor'])).toEqual([{ failure: 'Motor', count: 1 }]);
  });

  it('ordena por conteo descendente y luego alfabetico', () => {
    const result = countFailures(['b', 'b', 'a', 'a', 'c']);
    expect(result).toEqual([
      { failure: 'a', count: 2 },
      { failure: 'b', count: 2 },
      { failure: 'c', count: 1 },
    ]);
  });
});

describe('splitComponents (RF-21)', () => {
  it('separa por coma y limpia espacios', () => {
    expect(splitComponents('Freno, Motor ,Filtro')).toEqual(['Freno', 'Motor', 'Filtro']);
  });

  it('devuelve lista vacia si es null', () => {
    expect(splitComponents(null)).toEqual([]);
  });
});

describe('rangos de fecha', () => {
  it('dayRange arma un rango de 24 horas', () => {
    const { start, end } = dayRange('2026-05-10');
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(4);
    expect(start.getDate()).toBe(10);
    expect(end.getDate()).toBe(11);
  });

  it('monthRange arma un rango de mes completo y etiqueta', () => {
    const { start, end, label } = monthRange('2026-02');
    expect(start.getMonth()).toBe(1);
    expect(end.getMonth()).toBe(2);
    expect(end.getDate()).toBe(1);
    expect(label).toBe('2026-02');
  });

  it('monthRange rechaza un mes fuera de rango', () => {
    expect(() => monthRange('2026-13')).toThrow();
  });
});

describe('serializacion de reportes a CSV', () => {
  it('reporte diario', () => {
    const csv = dailyReportToCsv({
      date: '2026-05-10',
      busesDispatched: 8,
      fleetTotal: 10,
      frequencyCompliance: 91.5,
      alertsCount: 3,
      fleetKm: 12000,
    });
    expect(csv).toBe(
      'fecha,busesDespachados,flotaTotal,cumplimientoFrecuencia,alertas,kmFlota\r\n' +
        '2026-05-10,8,10,91.5,3,12000',
    );
  });

  it('reporte mensual con una fila por consorcio', () => {
    const csv = monthlyReportToCsv({
      month: '2026-02',
      totalMaintenance: 2,
      totalCost: 500,
      byConsortium: [
        {
          consortiumId: 'c1',
          consortiumName: 'Lima Bus',
          maintenanceCount: 2,
          totalCost: 500,
          vehicles: 4,
          vehiclesOperational: 3,
          availability: 75,
        },
      ],
    });
    expect(csv).toBe(
      'mes,consorcio,mantenimientos,costoTotal,vehiculos,operativos,disponibilidad\r\n' +
        '2026-02,Lima Bus,2,500,4,3,75',
    );
  });

  it('reporte de fallas recurrentes marca el grupo', () => {
    const csv = recurringFailuresToCsv({
      byDescription: [{ failure: 'Falla de freno', count: 2 }],
      byComponent: [{ failure: 'Freno', count: 2 }],
    });
    expect(csv).toBe(
      'grupo,falla,conteo\r\n' + 'descripcion,Falla de freno,2\r\n' + 'componente,Freno,2',
    );
  });
});
