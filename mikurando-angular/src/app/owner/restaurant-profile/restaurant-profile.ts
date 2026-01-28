import { Component } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FormArray } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormGroup, FormControl} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
    MatIconModule,
  ],
  templateUrl: './restaurant-profile.html',
  styleUrl: './restaurant-profile.scss',
})
export class RestaurantProfile {

  constructor(private http: HttpClient, private router: Router) {}

  availableZones = ['A1', 'A2', 'B1', 'B2', 'C1'];
  imageFileName = '';
  restaurantImage = '';

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
    address: new FormControl('', Validators.required),
    min_order_value: new FormControl('', Validators.required),
    delivery_radius: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    geo_lat: new FormControl(0),
    geo_lng: new FormControl(0),
    openingHours: this.openingHours,
  });

  get name() {
    return this.profileForm.get('name');
  }

  get description() {
    return this.profileForm.get('description');
  }

  get address() {
    return this.profileForm.get('address');
  }

  get minOrderValue() {
    return this.profileForm.get('min_order_value');
  }

  get deliveryRadius() {
    return this.profileForm.get('delivery_radius');
  }

  get category() {
    return this.profileForm.get('category');
  }

  get geoLat() {
    return this.profileForm.get('geo_lat');
  }

  get geoLng() {
    return this.profileForm.get('geo_lng');
  }

  payload: any = null;

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.imageFileName = file.name;
      
      // Lese die Datei als Base64-String
      const reader = new FileReader();
      reader.onload = () => {
        this.restaurantImage = reader.result as string;
        console.log('Bild geladen, Länge:', this.restaurantImage.length);
        console.log('Bild Preview:', this.restaurantImage.substring(0, 100));
      };
      reader.readAsDataURL(file);
    }
  }

  save() {

    if(this.profileForm.invalid) return;

    console.log('Form value:', this.profileForm.value);

    if(this.minOrderValue?.invalid) {
      this.minOrderValue.setValue('0');
    }

    console.log('Restaurant Image vor Payload:', this.restaurantImage ? 'Vorhanden (' + this.restaurantImage.length + ' chars)' : 'LEER');
    
    const payload = {
      restaurant_id: 0,
      restaurant_name: this.name?.value || '',
      description: this.description?.value || '',
      address: this.address?.value || '',
      min_order_value: Number(this.minOrderValue?.value) || 0,
      delivery_radius: Number(this.deliveryRadius?.value) || 0,
      image_data: this.restaurantImage || '',
      geo_lat: Number(this.geoLat?.value) || 0,
      geo_lng: Number(this.geoLng?.value) || 0,
      is_active: true,
      category: this.category?.value || '',
      opening_hours: this.profileForm.value.openingHours,
    };

    this.payload = payload; //nur für preview

    console.log('Payload image_data:', payload.image_data ? 'Vorhanden (' + payload.image_data.length + ' chars)' : 'LEER');
    console.log('Payload:', payload);

    this.http.post<any>('http://localhost:3000/restaurants', payload).subscribe({
      next: (res: any) => {
        console.log('Restaurant gespeichert', res);
        alert('Restaurant erfolgreich erstellt!');
        this.router.navigateByUrl('/ownerdash');
      },
      error: (err: any) => {
        console.error('Fehler:', err);
        alert('Fehler beim Speichern des Restaurants');
      },
    });
  }
}

