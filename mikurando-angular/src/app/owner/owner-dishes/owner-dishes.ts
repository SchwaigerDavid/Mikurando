import { Component, OnInit, inject, Inject, PLATFORM_ID, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-owner-dishes',
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './owner-dishes.html',
  styleUrl: './owner-dishes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnerDishes implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  restaurants: any[] = [];
  isLoading: boolean = true;
  private isShowingError: boolean = false;
  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    this.loadRestaurantData();
  }

  private loadRestaurantData(): void {
    this.authService.getOwnerRestaurant().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.restaurants = response.data;
          this.isLoading = false;
          this.cdr.markForCheck();

          // Lade Details asynchron nach Change Detection
          setTimeout(() => {
            this.restaurants.forEach((restaurant) => {
              this.loadRestaurantDetails(restaurant.restaurant_id);
            });
          }, 0);
        }
      },
      error: (err) => {
        console.error('Fehler beim Laden der Restaurants:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
        
        if (this.isShowingError) return;
        this.isShowingError = true;
        
        let errorMessage = 'Fehler beim Laden der Restaurants.';
        if (err.status === 401) {
          errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
        } else if (err.status === 403) {
          errorMessage = 'Sie haben keine Berechtigung, Restaurants zu sehen.';
        } else if (err.status === 404) {
          errorMessage = 'Keine Restaurants gefunden.';
        } else if (err.status === 500) {
          errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
        } else if (err.status === 0) {
          errorMessage = 'Keine Verbindung zum Server. Prüfen Sie Ihre Internetverbindung.';
        }
        
        if (typeof alert !== 'undefined') {
          alert(errorMessage);
        }
      },
    });
  }

  private loadRestaurantDetails(restaurantId: number): void {
    this.http
      .get<any>(`http://localhost:3000/restaurants/${restaurantId}`)
      .subscribe({
        next: (response) => {
          // Erstelle neue Array Referenz statt zu mutieren
          this.restaurants = this.restaurants.map((r: any) =>
            r.restaurant_id === restaurantId ? (response.data || response) : r
          );
          this.cdr.markForCheck();
          console.log(`Restaurant ${restaurantId} Details geladen:`, response);
        },
        error: (err) => {
          console.error(`Fehler beim Laden der Details für Restaurant ${restaurantId}:`, err);
          
          if (this.isShowingError) return;
          this.isShowingError = true;
          
          let errorMessage = `Fehler beim Laden der Dishes für Restaurant ${restaurantId}.`;
          if (err.status === 401) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
          } else if (err.status === 403) {
            errorMessage = 'Sie haben keine Berechtigung, diese Dishes zu sehen.';
          } else if (err.status === 404) {
            errorMessage = `Keine Dishes für dieses Restaurant gefunden.`;
          } else if (err.status === 500) {
            errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
          }
          
          if (typeof alert !== 'undefined') {
            alert(errorMessage);
          }
        },
      });
  }

  getDishesByCategory(restaurantId: number): { [key: string]: any[] } {
    const restaurant = this.restaurants.find((r: any) => r.restaurant_id === restaurantId);
    let dishes: any[] = [];

    if (restaurant && restaurant.menu_categories) {
      restaurant.menu_categories.forEach((category: any) => {
        if (category.dishes) {
          dishes = dishes.concat(category.dishes.map((dish: any) => ({
            ...dish,
            category: category.category_name
          })));
        }
      });
    }

    const grouped: { [key: string]: any[] } = {};
    dishes.forEach((dish) => {
      const category = dish.category || 'Ohne Kategorie';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(dish);
    });

    return grouped;
  }

  getCategoryKeys(restaurantId: number): string[] {
    return Object.keys(this.getDishesByCategory(restaurantId));
  }

  getImageUrl(imageData: string): SafeUrl {
    if (!imageData || !this.isBrowser) {
      return this.sanitizer.bypassSecurityTrustUrl('');
    }
    if (imageData.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(imageData);
    }
    return this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + imageData);
  }

  openCreateCategoryDialog(restaurantId: number): void {
    const dialogRef = this.dialog.open(CreateCategoryDialog, {
      width: '400px',
      data: { restaurantId },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.createCategoryOnBackend(restaurantId, result.name);
      }
    });
  }

  openEditDishDialog(restaurantId: number, dish: any): void {
    const dialogRef = this.dialog.open(EditDishDialog, {
      width: '600px',
      data: { restaurantId, dish: { ...dish } },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.updateDishOnBackend(restaurantId, dish.dish_id, result);
      }
    });
  }

  deleteDish(restaurantId: number, dishId: number, dishName: string): void {
    const confirmed = confirm(`Möchten Sie das Dish "${dishName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`);
    if (confirmed) {
      this.deleteDishOnBackend(restaurantId, dishId);
    }
  }

  private createCategoryOnBackend(restaurantId: number, categoryName: string): void {
    this.http
      .post<any>(`http://localhost:3000/owner/restaurants/${restaurantId}/categories`, {
        category_name: categoryName,
      })
      .subscribe({
        next: (response: any) => {
          console.log('Kategorie erfolgreich erstellt:', response);
          this.loadRestaurantDetails(restaurantId);
          if (typeof alert !== 'undefined') {
            alert(`Kategorie "${categoryName}" erfolgreich erstellt!`);
          }
        },
        error: (err: any) => {
          console.error('Fehler beim Erstellen der Kategorie:', err);
          
          if (this.isShowingError) return;
          this.isShowingError = true;
          
          let errorMessage = 'Fehler beim Erstellen der Kategorie.';
          if (err.status === 401) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
          } else if (err.status === 403) {
            errorMessage = 'Sie haben keine Berechtigung, Kategorien zu erstellen.';
          } else if (err.status === 400) {
            errorMessage = err.error?.error || 'Ungültige Daten. Bitte überprüfen Sie Ihre Eingabe.';
          } else if (err.status === 409) {
            errorMessage = 'Diese Kategorie existiert bereits.';
          } else if (err.status === 500) {
            errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
          }
          
          if (typeof alert !== 'undefined') {
            alert(errorMessage);
          }
        },
      });
  }

  private updateDishOnBackend(restaurantId: number, dishId: number, dishData: any): void {
    this.http
      .put<any>(`http://localhost:3000/owner/restaurants/${restaurantId}/dishes/${dishId}`, dishData)
      .subscribe({
        next: (response: any) => {
          console.log('Dish erfolgreich aktualisiert:', response);
          this.loadRestaurantDetails(restaurantId);
          if (typeof alert !== 'undefined') {
            alert('Dish erfolgreich aktualisiert!');
          }
        },
        error: (err: any) => {
          console.error('Fehler beim Aktualisieren des Dishes:', err);
          
          if (this.isShowingError) return;
          this.isShowingError = true;
          
          let errorMessage = 'Fehler beim Aktualisieren des Dishes.';
          if (err.status === 401) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
          } else if (err.status === 403) {
            errorMessage = 'Sie haben keine Berechtigung, dieses Dish zu bearbeiten.';
          } else if (err.status === 400) {
            errorMessage = err.error?.error || 'Ungültige Daten. Bitte überprüfen Sie Ihre Eingabe.';
          } else if (err.status === 404) {
            errorMessage = 'Dish oder Restaurant nicht gefunden.';
          } else if (err.status === 500) {
            errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
          }
          
          if (typeof alert !== 'undefined') {
            alert(errorMessage);
          }
        },
      });
  }

  private deleteDishOnBackend(restaurantId: number, dishId: number): void {
    this.http
      .delete<any>(`http://localhost:3000/owner/restaurants/${restaurantId}/dishes/${dishId}`)
      .subscribe({
        next: (response: any) => {
          console.log('Dish erfolgreich gelöscht:', response);
          this.loadRestaurantDetails(restaurantId);
          if (typeof alert !== 'undefined') {
            alert('Dish erfolgreich gelöscht!');
          }
        },
        error: (err: any) => {
          console.error('Fehler beim Löschen des Dishes:', err);
          
          if (this.isShowingError) return;
          this.isShowingError = true;
          
          let errorMessage = 'Fehler beim Löschen des Dishes.';
          if (err.status === 200) {
            errorMessage = 'Dish erfolgreich gelöscht!';
          } else if (err.status === 401) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
          } else if (err.status === 403) {
            errorMessage = 'Sie haben keine Berechtigung, dieses Dish zu löschen.';
          } else if (err.status === 404) {
            errorMessage = 'Dish oder Restaurant nicht gefunden.';
          } else if (err.status === 500) {
            errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
          }
          
          if (typeof alert !== 'undefined') {
            alert(errorMessage);
          }
        },
      });
  }
}

// Dialog-Komponente für Kategorie-Erstellung
@Component({
  selector: 'app-create-category-dialog',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>Neue Kategorie erstellen</h2>
      <mat-dialog-content>
        <form [formGroup]="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Kategorie Name</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Abbrechen</button>
        <button mat-raised-button color="primary" (click)="onCreate()" [disabled]="form.invalid">
          Erstellen
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class CreateCategoryDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
    });
  }

  onCreate(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
        restaurantId: this.data.restaurantId,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

// Dialog-Komponente für Dish-Bearbeitung
@Component({
  selector: 'app-edit-dish-dialog',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>Dish bearbeiten</h2>
      <mat-dialog-content>
        <form [formGroup]="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Dish Name</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Beschreibung</mat-label>
            <textarea matInput formControlName="description" rows="4"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Preis (€)</mat-label>
            <input matInput type="number" step="0.01" formControlName="price" />
          </mat-form-field>

          <div class="checkbox-group">
            <label>
              <input type="checkbox" formControlName="available" />
              Verfügbar
            </label>
          </div>

          <div class="image-upload-section">
            <div class="image-preview" *ngIf="imagePreview">
              <img [src]="imagePreview" alt="Vorschau" />
            </div>
            <label for="image-input" class="upload-label">
              <span>{{ imagePreview ? 'Bild ändern' : 'Bild hochladen' }}</span>
            </label>
            <input
              #imageInput
              id="image-input"
              type="file"
              accept="image/*"
              (change)="onImageSelected($event)"
              style="display: none"
            />
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Abbrechen</button>
        <button mat-raised-button color="primary" (click)="onUpdate()" [disabled]="form.invalid">
          Aktualisieren
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .checkbox-group {
        margin-bottom: 16px;
      }
      .image-preview {
        margin-bottom: 16px;
        max-width: 200px;
      }
      .image-preview img {
        max-width: 100%;
        border-radius: 4px;
      }
      .upload-label {
        cursor: pointer;
        color: #1976d2;
        text-decoration: underline;
      }
    `,
  ],
})
export class EditDishDialog {
  form: FormGroup;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditDishDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('EditDishDialog data:', data);
    const dish = data.dish;
    this.form = this.fb.group({
      name: [dish.name, [Validators.required, Validators.minLength(3)]],
      description: [dish.description, [Validators.required, Validators.minLength(10)]],
      price: [dish.price, [Validators.required, Validators.min(0.01)]],
      category_id: [dish.category_id, Validators.required],
      available: [dish.available],
      image_data: [''],
    });

    // Zeige das vorhandene Bild
    if (dish.image_data) {
      // Falls bereits mit Präfix, nutze es direkt, sonst füge es hinzu
      if (dish.image_data.startsWith('data:')) {
        this.imagePreview = dish.image_data;
      } else {
        this.imagePreview = 'data:image/png;base64,' + dish.image_data;
      }
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        // Entferne das Data-URI Präfix und behalte nur den Base64-String
        const base64String = e.target.result.split(',')[1];
        this.form.patchValue({
          image_data: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onUpdate(): void {
    if (this.form.valid) {
      // Extrahiere nur geänderte Felder (oder alle für simplicity)
      const payload = {
        name: this.form.value.name,
        description: this.form.value.description,
        price: parseFloat(this.form.value.price),
        category_id: this.form.value.category_id,
        available: this.form.value.available,
        image_data: this.form.value.image_data || '',
      };
      this.dialogRef.close(payload);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}