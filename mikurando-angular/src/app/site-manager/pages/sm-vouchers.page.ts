import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { DialogService } from '../ui/dialog.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';
import { AdminApiService, AdminVoucherDto } from '../services/admin-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
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

        <p *ngIf="vouchers().length === 0" style="opacity:.75; margin: 12px 0 0 0;">
          No Vouchers available.
        </p>

        <div style="margin-top: 16px;" *ngIf="vouchers().length > 0">
          <table mat-table [dataSource]="vouchers()" style="width: 100%">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let v">{{ v.code }}</td>
            </ng-container>
            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let v">{{ v.voucher_value }} {{ v.voucher_value_is_percentage ? '%' : '€' }}</td>
            </ng-container>
            <ng-container matColumnDef="valid">
              <th mat-header-cell *matHeaderCellDef>Valid Until</th>
              <td mat-cell *matCellDef="let v">{{ v.valid_until | date: 'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let v">
                <button mat-stroked-button color="warn" (click)="del(v)">Delete</button>
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
  private api = inject(AdminApiService);
  private dialogs = inject(DialogService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  private vouchersState = signal<AdminVoucherDto[]>([]);
  vouchers = computed(() => this.vouchersState());
  cols = ['code', 'value', 'valid', 'actions'];

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    value: [5, [Validators.required, Validators.min(0)]],
    isPercent: ['true', [Validators.required]],
    validUntil: [new Date(Date.now() + 7 * 86400000).toISOString(), [Validators.required]],
  });

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.show();
    this.api.listVouchers().subscribe({
      next: (rows) => this.vouchersState.set(rows ?? []),
      error: () => this.notify.error('Vouchers could not be loaded.'),
      complete: () => this.loading.hide(),
    });
  }

  create() {
    if (this.form.invalid) return;

    this.loading.show();
    const v = this.form.getRawValue();
    const isPercent = String(v.isPercent).toLowerCase() === 'true';

    this.api
      .createVoucher({
        code: String(v.code).toUpperCase(),
        value: Number(v.value),
        is_percent: isPercent,
        valid_until: String(v.validUntil),
      })
      .subscribe({
        next: () => {
          this.notify.success('Voucher added');
          this.form.patchValue({ code: '' });
          this.reload();
        },
        error: (err) => {
          const msg = err?.error?.error ?? 'Voucher could not be created';
          this.notify.error(msg);
        },
        complete: () => this.loading.hide(),
      });
  }

  async del(v: AdminVoucherDto) {
    const ok = await this.dialogs.confirm({
      title: 'Delete voucher',
      message: `Should the voucher ${v.code} be deleted?`,
      confirmText: 'Delete',
    });
    if (!ok) return;

    this.loading.show();
    this.api.deleteVoucher(v.voucher_id).subscribe({
      next: () => {
        this.vouchersState.set(this.vouchersState().filter((x) => x.voucher_id !== v.voucher_id));
        this.notify.info('Voucher deleted');
      },
      error: () => this.notify.error('Delete failed'),
      complete: () => this.loading.hide(),
    });
  }
}
