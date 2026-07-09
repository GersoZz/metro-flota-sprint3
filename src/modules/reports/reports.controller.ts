import type { Request, Response } from 'express';
import { getDailyReport, getMonthlyReport, getRecurringFailures } from './reports.service.js';
import {
  dailyReportToCsv,
  monthlyReportToCsv,
  recurringFailuresToCsv,
} from './reports.csv.js';
import type {
  DailyReportQuery,
  MonthlyReportQuery,
  RecurringFailuresQuery,
} from './reports.schema.js';

// Escribe una respuesta CSV con los encabezados de descarga y el nombre de
// archivo indicado (RF-26).
function sendCsv(res: Response, filename: string, csv: string): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

export async function dailyReportHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as DailyReportQuery;
  const report = await getDailyReport(query);
  if (query.format === 'csv') {
    sendCsv(res, `reporte-diario-${report.date}.csv`, dailyReportToCsv(report));
    return;
  }
  res.json(report);
}

export async function monthlyReportHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as MonthlyReportQuery;
  const report = await getMonthlyReport(query);
  if (query.format === 'csv') {
    sendCsv(res, `reporte-mensual-${report.month}.csv`, monthlyReportToCsv(report));
    return;
  }
  res.json(report);
}

export async function recurringFailuresHandler(req: Request, res: Response): Promise<void> {
  const query = req.valid!.query as RecurringFailuresQuery;
  const report = await getRecurringFailures(query);
  if (query.format === 'csv') {
    sendCsv(res, 'fallas-recurrentes.csv', recurringFailuresToCsv(report));
    return;
  }
  res.json(report);
}
