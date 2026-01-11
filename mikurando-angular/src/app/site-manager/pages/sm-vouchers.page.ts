import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { SiteManagerMockService } from '../services/site-manager-mock.service';
import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
  ],
  template: `
    <mat-card>
      <mat-card-title>Vouchers / Promo Codes</mat-card-title>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="create()" style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: end;">
          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Value</mat-label>
            <input matInput type="number" formControlName="value" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Percent? (true/false)</mat-label>
            <input matInput formControlName="isPercent" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Valid Until (ISO)</mat-label>
            <input matInput formControlName="validUntil" />
          </mat-form-field>

          <div style="grid-column: 1 / -1; display:flex; gap:12px; align-items:center;">
            <button mat-flat-button color="primary" [disabled]="form.invalid">Create Voucher</button>
            <span style="opacity:.75">Tipp: isPercent = true/false</span>
          </div>
        </form>

        <div style="margin-top: 16px;">
          <table mat-table [dataSource]="vouchers()" style="width: 100%">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let v">{{ v.code }}</td>
            </ng-container>
            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let v">{{ v.value }} {{ v.isPercent ? '%' : '€' }}</td>
            </ng-container>
            <ng-container matColumnDef="valid">
              <th mat-header-cell *matHeaderCellDef>Valid Until</th>
              <td mat-cell *matCellDef="let v">{{ v.validUntil | date: 'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let v">
                <button mat-stroked-button color="warn" (click)="del(v.id, v.code)">Delete</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class SmVouchersPage {
  private fb = inject(FormBuilder);
  private sm = inject(SiteManagerMockService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  vouchers = computed(() => this.sm.getVouchers()());
  cols = ['code', 'value', 'valid', 'actions'];

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    value: [5, [Validators.required, Validators.min(0)]],
    isPercent: ['true', [Validators.required]],
    validUntil: [new Date(Date.now() + 7 * 86400000).toISOString(), [Validators.required]],
  });

  create() {
    if (this.form.invalid) return;

    this.loading.show();
    try {
      const v = this.form.getRawValue();
      this.sm.createVoucher({
        code: String(v.code).toUpperCase(),
        value: Number(v.value),
        isPercent: String(v.isPercent).toLowerCase() === 'true',
        validUntil: String(v.validUntil),
      });
      this.notify.success('Voucher erstellt');
      this.form.patchValue({ code: '' });
    } finally {
      this.loading.hide();
    }
  }

  async del(id: number, code: string) {
    const ok = await this.dialogs.confirm({
      title: 'Delete voucher',
      message: `Voucher ${code} wirklich löschen?`,
      confirmText: 'Delete',
    });
    if (!ok) return;

    this.loading.show();
    try {
      this.sm.deleteVoucher(id);
      this.notify.info('Voucher gelöscht');
    } finally {
      this.loading.hide();
    }
  }
}
