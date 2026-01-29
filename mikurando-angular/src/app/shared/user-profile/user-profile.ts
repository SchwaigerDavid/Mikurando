import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  userData: any = null;
  isLoading = false;
  isEditing = false;
  editData: any = {};
  isSaving = false;
  apiBaseUrl = 'http://localhost:3000';

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;
    const user = this.authService.user();
    
    if (user) {
      this.http.get<any>(`${this.apiBaseUrl}/user/profile`).subscribe({
        next: (response) => {
          console.log('Empfangene Daten:', response);
          this.userData = response.data;
          this.editData = { ...this.userData };
          this.isLoading = false;
          console.log('userData gesetzt zu:', this.userData);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Fehler beim Laden der Benutzerdaten:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editData = { ...this.userData };
    }
  }

  saveChanges() {
    this.isSaving = true;
    const user = this.authService.user();

    if (user) {
      // Erstelle das Payload im benötigten Format
      const updatePayload = {
        user_id: this.userData.user_id,
        email: this.editData.email,
        role: this.userData.role,
        surname: this.editData.surname,
        name: this.editData.name,
        address: this.editData.address,
        geo_lat: this.userData.geo_lat,
        geo_lng: this.userData.geo_lng,
        profile_picture_data: this.userData.profile_picture
      };

      this.http.put(`${this.apiBaseUrl}/user/profile`, updatePayload).subscribe({
        next: (response: any) => {
          this.userData = { ...this.userData, ...this.editData };
          this.isEditing = false;
          this.isSaving = false;
          this.cdr.detectChanges();
          alert('Profil erfolgreich aktualisiert!');
        },
        error: (err) => {
          console.error('Fehler beim Aktualisieren des Profils:', err);
          this.isSaving = false;
          this.cdr.detectChanges();
          alert('Fehler beim Aktualisieren des Profils');
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
  }

  goBack() {
    this.location.back();
  }
}
