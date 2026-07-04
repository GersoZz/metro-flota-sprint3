// Ayudantes para serializar reportes a CSV en texto plano (RF-26).
// No usan librerias externas: se arma el string a mano.
import type {
  DailyReportDTO,
  MonthlyReportDTO,
  RecurringFailuresDTO,
} from './reports.service.js';

// Valor de una celda del CSV. Los null y undefined se vuelven cadena vacia.
export type CsvValue = string | number | null | undefined;

// Escapa una celda segun la convencion RFC 4180: si el valor tiene coma,
// comillas o salto de linea, se envuelve en comillas y las comillas internas
// se duplican.
export function escapeCsvCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// Arma una fila del CSV a partir de una lista de celdas.
export function toCsvRow(cells: CsvValue[]): string {
  return cells.map(escapeCsvCell).join(',');
}

// Arma un CSV completo con una fila de cabecera y las filas de datos.
// Usa CRLF como separador de linea por ser lo mas compatible.
export function buildCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [toCsvRow(headers), ...rows.map(toCsvRow)];
  return lines.join('\r\n');
}

// Serializa el reporte diario a CSV. Al ser una sola fila, se usa una tabla
// de una linea con sus columnas.
export function dailyReportToCsv(report: DailyReportDTO): string {
  return buildCsv(
    ['fecha', 'busesDespachados', 'flotaTotal', 'cumplimientoFrecuencia', 'alertas', 'kmFlota'],
    [
      [
        report.date,
        report.busesDispatched,
        report.fleetTotal,
        report.frequencyCompliance,
        report.alertsCount,
        report.fleetKm,
      ],
    ],
  );
}

// Serializa el reporte mensual a CSV con una fila por consorcio.
export function monthlyReportToCsv(report: MonthlyReportDTO): string {
  return buildCsv(
    ['mes', 'consorcio', 'mantenimientos', 'costoTotal', 'vehiculos', 'operativos', 'disponibilidad'],
    report.byConsortium.map((row) => [
      report.month,
      row.consortiumName,
      row.maintenanceCount,
      row.totalCost,
      row.vehicles,
      row.vehiclesOperational,
      row.availability,
    ]),
  );
}

// Serializa el reporte de fallas recurrentes a CSV. Se listan primero las
// agrupadas por descripcion y luego por componente, marcando la fuente.
export function recurringFailuresToCsv(report: RecurringFailuresDTO): string {
  const rows: CsvValue[][] = [];
  for (const row of report.byDescription) {
    rows.push(['descripcion', row.failure, row.count]);
  }
  for (const row of report.byComponent) {
    rows.push(['componente', row.failure, row.count]);
  }
  return buildCsv(['grupo', 'falla', 'conteo'], rows);
}
