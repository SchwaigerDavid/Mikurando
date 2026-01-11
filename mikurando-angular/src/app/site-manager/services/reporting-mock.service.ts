import { Injectable } from '@angular/core';

export type ReportRow = {
  date: string; // YYYY-MM-DD
  orders: number;
  revenueEur: number;
  logins: number;
  changes: number;
};

@Injectable({ providedIn: 'root' })
export class ReportingMockService {
  generateDailyReport(days = 14): ReportRow[] {
    const today = new Date();
    const rows: ReportRow[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      //deterministic pseudo-random
      const seed = hash(key);
      const orders = 120 + (seed % 80);
      const revenueEur = Math.round((orders * (12 + (seed % 9))) * 100) / 100;
      const logins = 200 + (seed % 150);
      const changes = 15 + (seed % 18);

      rows.push({ date: key, orders, revenueEur, logins, changes });
    }

    return rows;
  }

  toCsv(rows: ReportRow[]): string {
    const header = 'date,orders,revenueEur,logins,changes';
    const lines = rows.map((r) => `${r.date},${r.orders},${r.revenueEur},${r.logins},${r.changes}`);
    return [header, ...lines].join('\n');
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
