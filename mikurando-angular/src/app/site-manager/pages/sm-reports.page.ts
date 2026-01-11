import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { ReportingMockService, ReportRow } from '../services/reporting-mock.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

@Component({
  standalone: true,
  imports: [NgIf, CurrencyPipe, MatCardModule, MatButtonModule, MatTableModule],
  template: `
    <mat-card>
      <mat-card-title>Reporting</mat-card-title>
      <mat-card-content>
        <div style="display:flex; gap:12px; flex-wrap: wrap; align-items:center;">
          <button mat-flat-button color="primary" (click)="generate()">Generate last {{ days() }} days</button>
          <button mat-stroked-button (click)="downloadCsv()" [disabled]="rows().length === 0">Download CSV</button>
        </div>

        <div class="kpis" *ngIf="rows().length > 0">
          <mat-card>
            <mat-card-title>Total Orders</mat-card-title>
            <mat-card-content class="metric">{{ totals().orders }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-title>Total Revenue</mat-card-title>
            <mat-card-content class="metric">{{ totals().revenue | currency:'EUR' }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-title>Total Logins</mat-card-title>
            <mat-card-content class="metric">{{ totals().logins }}</mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-title>Total Changes</mat-card-title>
            <mat-card-content class="metric">{{ totals().changes }}</mat-card-content>
          </mat-card>
        </div>

        <div style="margin-top:16px;" *ngIf="rows().length > 0">
          <table mat-table [dataSource]="rows()" style="width:100%">
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
            <ng-container matColumnDef="logins">
              <th mat-header-cell *matHeaderCellDef>Logins</th>
              <td mat-cell *matCellDef="let r">{{ r.logins }}</td>
            </ng-container>
            <ng-container matColumnDef="changes">
              <th mat-header-cell *matHeaderCellDef>Changes</th>
              <td mat-cell *matCellDef="let r">{{ r.changes }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .kpis {
        margin-top: 16px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }
      .metric {
        font-size: 24px;
        font-weight: 700;
        padding: 10px 0;
      }
      @media (max-width: 1000px) {
        .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 600px) {
        .kpis { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class SmReportsPage {
  private reports = inject(ReportingMockService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  cols = ['date', 'orders', 'revenue', 'logins', 'changes'];

  days = signal(14);
  rows = signal<ReportRow[]>([]);

  totals = computed(() => {
    const rows = this.rows();
    return {
      orders: rows.reduce((s, r) => s + r.orders, 0),
      revenue: rows.reduce((s, r) => s + r.revenueEur, 0),
      logins: rows.reduce((s, r) => s + r.logins, 0),
      changes: rows.reduce((s, r) => s + r.changes, 0),
    };
  });

  generate() {
    this.loading.show();
    try {
      this.rows.set(this.reports.generateDailyReport(this.days()));
      this.notify.success('Report generiert (mock)');
    } finally {
      this.loading.hide();
    }
  }

  downloadCsv() {
    const csv = this.reports.toCsv(this.rows());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    this.notify.info('CSV Download gestartet');
  }
}
