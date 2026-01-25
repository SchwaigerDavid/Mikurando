import { Component } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FormArray } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {FormGroup, FormControl} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';

import { validOpeningHoursValidator } from './opening-hours.validator';



@Component({
  selector: 'app-restaurant-profile',
  imports: [
    MatButtonModule,
    CommonModule,
    MatCardModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
  ],
  templateUrl: './restaurant-profile.html',
  styleUrl: './restaurant-profile.scss',
})
export class RestaurantProfile {

  constructor(private http: HttpClient) {}

  availableZones = ['A1', 'A2', 'B1', 'B2', 'C1'];

  openingHours = new FormArray(
    ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day =>
      new FormGroup({
        day: new FormControl(day),
        open: new FormControl('09:00'),
        close: new FormControl('22:00'),
        closed: new FormControl(false),
      }, { validators: validOpeningHoursValidator() })
    )
  );

  profileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    adress: new FormControl('', Validators.required), //name korrekt so
    area_code: new FormControl('', Validators.required),
    customer_notes: new FormControl(''),
    min_order_value: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),

    deliveryZones: new FormControl<string[]>([], Validators.required),

    openingHours: this.openingHours,
  });

  get name() {
    return this.profileForm.get('name');
  }

  get description() {
    return this.profileForm.get('description');
  }

  get adress() {
    return this.profileForm.get('adress');
  }

  get areaCode() {
    return this.profileForm.get('area_code');
  }

  get customerNotes() {
    return this.profileForm.get('customer_notes');
  }

  get minOrderValue() {
    return this.profileForm.get('min_order_value');
  }

  get category() {
    return this.profileForm.get('category');
  }

  get owner_id(){
    return 123;
    //get correct owner id by user id when backend is connected
  }

  get restaurant_id(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  get deliveryZones() {
    return this.profileForm.get('deliveryZones');
  }

  payload: any = null;

  save() {

    if(this.profileForm.invalid) return;

    console.log('Form value:', this.profileForm.value);

    if(this.minOrderValue?.invalid) {
      this.minOrderValue.setValue('0');
    }

    const payload = {
      restaurant_name: this.name?.value,
      description: this.description?.value,
      address: this.adress?.value,
      area_code: this.areaCode?.value,
      customer_notes: this.customerNotes?.value,
      min_order_value: Number(this.minOrderValue?.value),
      category: this.category?.value,

      delivery_zones: this.deliveryZones?.value,
      opening_hours: this.profileForm.value.openingHours,

      owner_id: this.owner_id,
    };

    this.payload = payload; //nur für preview


    console.log('Payload:', payload);

    this.http.post<any>('http://localhost:3000/restaurants', payload).subscribe({
      next: (res: any) => console.log('Restaurant gespeichert', res),
      error: (err: any) => console.error('Fehler:', err),
    });
  }
}

