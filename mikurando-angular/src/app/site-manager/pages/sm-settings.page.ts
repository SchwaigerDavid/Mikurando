import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { SiteManagerMockService } from '../services/site-manager-mock.service';
import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
  ],
  template: `
    <div style="display:grid; gap:16px;">
      <mat-card>
        <mat-card-title>Service Fees</mat-card-title>
        <mat-card-content>
          <form [formGroup]="feeForm" (ngSubmit)="saveFee()" style="display:flex; gap:12px; align-items: baseline; flex-wrap: wrap;">
            <mat-form-field appearance="outline">
              <mat-label>Service Fee (%)</mat-label>
              <input matInput type="number" formControlName="fee" />
            </mat-form-field>
            <button mat-flat-button color="primary" [disabled]="feeForm.invalid">Save</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>Allowed Delivery Zones</mat-card-title>
        <mat-card-content>
          <form [formGroup]="zoneForm" (ngSubmit)="addZone()" style="display:flex; gap:12px; align-items: baseline; flex-wrap: wrap;">
            <mat-form-field appearance="outline">
              <mat-label>Zone Code (e.g. A1)</mat-label>
              <input matInput formControlName="code" />
            </mat-form-field>
            <button mat-stroked-button color="primary" [disabled]="zoneForm.invalid">Add</button>
          </form>

          <div style="margin-top: 12px; display:flex; gap:8px; flex-wrap: wrap;">
            <mat-chip *ngFor="let z of settings().allowedZones" (removed)="removeZone(z)">
              {{ z }}
              <button matChipRemove aria-label="Remove">×</button>
            </mat-chip>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SmSettingsPage {
  private fb = inject(FormBuilder);
  private sm = inject(SiteManagerMockService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  settings = computed(() => this.sm.getSettings()());

  feeForm = this.fb.group({
    fee: [this.settings().serviceFeePercent, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  zoneForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(6)]],
  });

  saveFee() {
    this.loading.show();
    try {
      this.sm.setServiceFeePercent(Number(this.feeForm.value.fee ?? 0));
      this.notify.success('Service fee gespeichert');
    } finally {
      this.loading.hide();
    }
  }

  addZone() {
    this.loading.show();
    try {
      this.sm.addZone(String(this.zoneForm.value.code ?? ''));
      this.notify.success('Zone hinzugefügt');
      this.zoneForm.reset();
    } finally {
      this.loading.hide();
    }
  }

  removeZone(z: string) {
    this.loading.show();
    try {
      this.sm.removeZone(z);
      this.notify.info('Zone entfernt');
    } finally {
      this.loading.hide();
    }
  }
}
