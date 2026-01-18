import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { NotifyService } from '../ui/notify.service';
import { LoadingOverlayService } from '../ui/loading-overlay.service';
import { AdminApiService, DeliveryZoneDto } from '../services/admin-api.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
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
              <mat-label>Service Fee (EUR)</mat-label>
              <input matInput type="number" formControlName="fee" />
            </mat-form-field>
            <button mat-flat-button color="primary" [disabled]="feeForm.invalid">Save</button>
            <button type="button" mat-stroked-button color="warn" (click)="resetFee()">Reset</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>Allowed Delivery Zones</mat-card-title>
        <mat-card-content>
          <form [formGroup]="zoneForm" (ngSubmit)="addZone()" style="display:flex; gap:12px; align-items: baseline; flex-wrap: wrap;">
            <mat-form-field appearance="outline">
              <mat-label>Zone Name</mat-label>
              <input matInput formControlName="zone_name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Max Radius (km)</mat-label>
              <input matInput type="number" formControlName="max_radius_km" />
            </mat-form-field>
            <button mat-stroked-button color="primary" [disabled]="zoneForm.invalid">Add</button>
          </form>

          <p *ngIf="zones().length === 0" style="opacity:.75; margin: 12px 0 0 0;">
            Keine Zonen vorhanden.
          </p>

          <div *ngIf="zones().length > 0" style="margin-top: 12px; display:flex; gap:8px; flex-wrap: wrap;">
            <mat-chip *ngFor="let z of zones()" (removed)="removeZone(z)">
              {{ z.zone_name }}
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
  private api = inject(AdminApiService);
  private notify = inject(NotifyService);
  private loading = inject(LoadingOverlayService);

  private settingsState = injectSettingsState();
  zones = computed(() => this.settingsState.zones());

  feeForm = this.fb.group({
    fee: [0, [Validators.required, Validators.min(0)]],
  });

  zoneForm = this.fb.group({
    zone_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(32)]],
    max_radius_km: [null as number | null],
  });

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.show();
    Promise.all([
      firstValueFrom(this.api.getSettings()),
      firstValueFrom(this.api.getDeliveryZones()),
    ])
      .then(([settings, zones]) => {
        this.feeForm.patchValue({ fee: settings.default_service_fee });
        this.settingsState.setZones(zones ?? []);
      })
      .catch(() => this.notify.error('Konnte Settings/Zonen nicht laden'))
      .finally(() => this.loading.hide());
  }

  saveFee() {
    if (this.feeForm.invalid) return;

    this.loading.show();
    this.api
      .updateSettings({ default_service_fee: Number(this.feeForm.value.fee ?? 0) })
      .subscribe({
        next: () => this.notify.success('Service fee gespeichert'),
        error: () => this.notify.error('Speichern fehlgeschlagen'),
        complete: () => this.loading.hide(),
      });
  }

  resetFee() {
    this.loading.show();
    this.api.resetSettings().subscribe({
      next: (settings) => {
        this.feeForm.patchValue({ fee: settings.default_service_fee });
        this.notify.info('Service fee zurückgesetzt');
      },
      error: () => this.notify.error('Zurücksetzen fehlgeschlagen'),
      complete: () => this.loading.hide(),
    });
  }

  addZone() {
    if (this.zoneForm.invalid) return;

    this.loading.show();
    const name = String(this.zoneForm.value.zone_name ?? '').trim();
    const radius = this.zoneForm.value.max_radius_km;

    this.api.createDeliveryZone({ zone_name: name, max_radius_km: radius ?? null }).subscribe({
      next: (created) => {
        this.settingsState.setZones(
          [created, ...this.zones()].sort((a, b) => a.zone_name.localeCompare(b.zone_name)),
        );
        this.notify.success('Zone hinzugefügt');
        this.zoneForm.reset({ zone_name: '', max_radius_km: null });
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Zone konnte nicht hinzugefügt werden';
        this.notify.error(msg);
      },
      complete: () => this.loading.hide(),
    });
  }

  removeZone(z: DeliveryZoneDto) {
    this.loading.show();
    this.api.deleteDeliveryZone(z.id).subscribe({
      next: () => {
        this.settingsState.setZones(this.zones().filter((x: DeliveryZoneDto) => x.id !== z.id));
        this.notify.info('Zone entfernt');
      },
      error: () => this.notify.error('Zone konnte nicht entfernt werden'),
      complete: () => this.loading.hide(),
    });
  }
}

function injectSettingsState() {
  const zonesSig = signal<DeliveryZoneDto[]>([]);
  return {
    zones: zonesSig.asReadonly(),
    setZones: (z: DeliveryZoneDto[]) => zonesSig.set(z),
  };
}
