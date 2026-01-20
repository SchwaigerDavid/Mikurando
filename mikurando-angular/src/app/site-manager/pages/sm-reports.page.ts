import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { AdminApiService } from '../services/admin-api.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

type PlatformRow = {
  date: string; // YYYY-MM-DD
  orders: number;
  revenueEur: number;
};

type UserTrendsRow = {
  date: string;
  logins: number;
  changes: number;
};

@Component({
  standalone: true,
  imports: [NgIf, CurrencyPipe, MatCardModule, MatButtonModule, MatTableModule],
  template: `
    <div style="display:grid; gap:16px;">
      <mat-card>
        <mat-card-title>Platform-wide Reports</mat-card-title>
        <mat-card-content>
          <div style="display:flex; gap:12px; flex-wrap: wrap; align-items:center;">
            <button mat-flat-button color="primary" (click)="generatePlatform()">
              Generate last {{ days() }} days
            </button>
            <button
              mat-stroked-button
              (click)="downloadPlatformCsv()"
              [disabled]="platformRows().length === 0"
            >
              Download CSV
            </button>
          </div>

          <p *ngIf="platformRows().length === 0" style="opacity:.75; margin: 12px 0 0 0;">
            No platform report data yet (empty database or no orders in the selected range).
          </p>

          <div class="kpis" *ngIf="platformRows().length > 0">
            <mat-card>
              <mat-card-title>Total Orders</mat-card-title>
              <mat-card-content class="metric">{{ platformTotals().orders }}</mat-card-content>
            </mat-card>
            <mat-card>
              <mat-card-title>Total Revenue</mat-card-title>
              <mat-card-content class="metric">{{ platformTotals().revenue | currency:'EUR' }}</mat-card-content>
            </mat-card>
          </div>

          <div style="margin-top:16px;" *ngIf="platformRows().length > 0">
            <table mat-table [dataSource]="platformRows()" style="width:100%">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.date }}</td>
              </ng-container>

              <ng-container matColumnDef="orders">
                <th mat-header-cell *matHeaderCellDef>Orders</th>
                <td mat-cell *matCellDef="let r">{{ r.orders }}</td>
              </ng-container>

              <ng-container matColumnDef="revenue">
                <th mat-header-cell *matHeaderCellDef>Revenue</th>
                <td mat-cell *matCellDef="let r">{{ r.revenueEur | currency:'EUR' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="platformCols"></tr>
              <tr mat-row *matRowDef="let row; columns: platformCols"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>User Activity Trends</mat-card-title>
        <mat-card-content>
          <div style="display:flex; gap:12px; flex-wrap: wrap; align-items:center;">
            <button mat-flat-button color="primary" (click)="generateUserTrends()">
              Generate last {{ days() }} days
            </button>
            <button
              mat-stroked-button
              (click)="downloadUserTrendsCsv()"
              [disabled]="userTrendsRows().length === 0"
            >
              Download CSV
            </button>
          </div>

          <p *ngIf="userTrendsRows().length === 0" style="opacity:.75; margin: 12px 0 0 0;">
            No user activity data yet (empty database or tracking not enabled).
          </p>

          <div class="kpis" *ngIf="userTrendsRows().length > 0">
            <mat-card>
              <mat-card-title>Total Logins</mat-card-title>
              <mat-card-content class="metric">{{ userTrendsTotals().logins }}</mat-card-content>
            </mat-card>
            <mat-card>
              <mat-card-title>Total Changes</mat-card-title>
              <mat-card-content class="metric">{{ userTrendsTotals().changes }}</mat-card-content>
            </mat-card>
          </div>

          <div style="margin-top:16px;" *ngIf="userTrendsRows().length > 0">
            <table mat-table [dataSource]="userTrendsRows()" style="width:100%">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.date }}</td>
              </ng-container>

              <ng-container matColumnDef="logins">
                <th mat-header-cell *matHeaderCellDef>Logins</th>
                <td mat-cell *matCellDef="let r">{{ r.logins }}</td>
              </ng-container>

              <ng-container matColumnDef="changes">
                <th mat-header-cell *matHeaderCellDef>Changes</th>
                <td mat-cell *matCellDef="let r">{{ r.changes }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="userTrendsCols"></tr>
              <tr mat-row *matRowDef="let row; columns: userTrendsCols"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .kpis {
        margin-top: 16px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .metric {
        font-size: 24px;
        font-weight: 700;
        padding: 10px 0;
      }
      @media (max-width: 700px) {
        .kpis {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SmReportsPage {
  private api = inject(AdminApiService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  days = signal(14);

  platformCols = ['date', 'orders', 'revenue'];
  platformRows = signal<PlatformRow[]>([]);

  userTrendsCols = ['date', 'logins', 'changes'];
  userTrendsRows = signal<UserTrendsRow[]>([]);

  platformTotals = computed(() => {
    const rows = this.platformRows();
    return {
      orders: rows.reduce((s, r) => s + r.orders, 0),
      revenue: rows.reduce((s, r) => s + r.revenueEur, 0),
    };
  });

  userTrendsTotals = computed(() => {
    const rows = this.userTrendsRows();
    return {
      logins: rows.reduce((s, r) => s + r.logins, 0),
      changes: rows.reduce((s, r) => s + r.changes, 0),
    };
  });

  private toRange() {
    const d = new Date();
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (this.days() - 1));

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }

  generatePlatform() {
    this.loading.show();

    const range = this.toRange();

    let ordersRows: Array<{ date: string; orders: number }> = [];
    let revenueRows: Array<{ date: string; revenue: number }> = [];
    let errors = 0;

    const maybeFinish = () => {
      //wait for both requests to finish
      if ((ordersRows as any).__done && (revenueRows as any).__done) {
        const map = new Map<string, PlatformRow>();

        const ensure = (date: string) => {
          if (!map.has(date)) map.set(date, { date, orders: 0, revenueEur: 0 });
          return map.get(date)!;
        };

        for (const o of ordersRows) ensure(o.date).orders = Number((o as any).orders ?? 0);
        for (const r of revenueRows) ensure(r.date).revenueEur = Number((r as any).revenue ?? 0);

        const rows = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
        this.platformRows.set(rows);

        if (errors === 0) this.notify.success('Platform report loaded');
        this.loading.hide();
      }
    };

    this.api.reportOrders(range).subscribe({
      next: (r) => (ordersRows = (r ?? []) as any),
      error: () => {
        errors++;
        this.notify.error('Orders report failed');
      },
      complete: () => {
        (ordersRows as any).__done = true;
        maybeFinish();
      },
    });

    this.api.reportRevenue(range).subscribe({
      next: (r) => (revenueRows = (r ?? []) as any),
      error: () => {
        errors++;
        this.notify.error('Revenue report failed');
      },
      complete: () => {
        (revenueRows as any).__done = true;
        maybeFinish();
      },
    });
  }

  generateUserTrends() {
    this.loading.show();

    const range = this.toRange();

    this.api.reportUserEvents(range).subscribe({
      next: (r) => {
        const rows = (r ?? []) as any[];
        this.userTrendsRows.set(
          rows
            .map((x) => ({
              date: String((x as any).date),
              logins: Number((x as any).logins ?? 0),
              changes: Number((x as any).changes ?? 0),
            }))
            .sort((a, b) => a.date.localeCompare(b.date)),
        );
      },
      error: (err) => {
        if (err?.status === 401 || err?.status === 403) {
          this.notify.error('User activity report failed (not authorized). Please login as MANAGER.');
        } else {
          this.notify.error('User activity report failed');
        }
      },
      complete: () => {
        this.notify.success('User activity report loaded');
        this.loading.hide();
      },
    });
  }

  downloadPlatformCsv() {
    const header = 'date,orders,revenueEur';
    const lines = this.platformRows().map((r) => `${r.date},${r.orders},${r.revenueEur}`);
    const csv = [header, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    this.notify.info('CSV download started');
  }

  downloadUserTrendsCsv() {
    const header = 'date,logins,changes';
    const lines = this.userTrendsRows().map((r) => `${r.date},${r.logins},${r.changes}`);
    const csv = [header, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-trends-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    this.notify.info('CSV download started');
  }
}
