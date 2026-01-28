import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-create-dish',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './create-dish.html',
  styleUrl: './create-dish.scss',
})
export class CreateDishComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  restaurantId: number = 0;
  categories: any[] = [];
  isLoading: boolean = false;
  isCategoriesLoading: boolean = true;
  imagePreview: string | null = null;
  private isShowingError: boolean = false;

  ngOnInit(): void {
    // Get restaurantId from route params
    this.route.params.subscribe((params) => {
      this.restaurantId = parseInt(params['restaurantId'], 10);
      if (this.restaurantId) {
        this.loadCategories();
        this.initializeForm();
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category_id: ['', Validators.required],
      available: [true],
      image_data: [''],
    });
  }

  private loadCategories(): void {
    this.isCategoriesLoading = true;
    this.http
      .get<any>(`http://localhost:3000/owner/restaurants/${this.restaurantId}/categories`)
      .subscribe({
        next: (response) => {
          this.categories = response;
          this.isCategoriesLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Fehler beim Laden der Kategorien:', err);
          this.isCategoriesLoading = false;
          
          if (this.isShowingError) return;
          this.isShowingError = true;
          
          let errorMessage = 'Fehler beim Laden der Kategorien.';
          if (err.status === 401) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
            this.router.navigate(['/login']);
          } else if (err.status === 403) {
            errorMessage = 'Sie haben keine Berechtigung, Kategorien zu sehen.';
          } else if (err.status === 404) {
            errorMessage = 'Keine Kategorien gefunden. Erstellen Sie zunächst eine Kategorie.';
          } else if (err.status === 500) {
            errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
          }
          
          alert(errorMessage);
          this.cdr.detectChanges();
        },
      });
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

  onSubmit(): void {
    if (!this.form.valid) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus!');
      return;
    }

    this.isLoading = true;

    const payload = {
      name: this.form.value.name,
      description: this.form.value.description,
      price: parseFloat(this.form.value.price),
      category_id: parseInt(this.form.value.category_id, 10),
      available: this.form.value.available,
      image_data: this.form.value.image_data || '',
    };

    this.http
      .post<any>(
        `http://localhost:3000/owner/restaurants/${this.restaurantId}/dishes`,
        payload
      )
      .subscribe({
        next: (response) => {
          console.log('Dish erfolgreich erstellt:', response);
          alert('Dish erfolgreich erstellt!');
          this.isLoading = false;
          // Zurück zur owner-dishes Seite
          this.router.navigate(['/owner/dishes']);
        },
        error: (err) => {
          console.error('Fehler beim Erstellen des Dishes:', err);
          this.isLoading = false;
          
          if (this.isShowingError) return;
          this.isShowingError = true;
          
          let errorMessage = 'Fehler beim Erstellen des Dishes.';
          if (err.status === 401) {
            errorMessage = 'Sie sind nicht angemeldet. Bitte loggen Sie sich ein.';
            this.router.navigate(['/login']);
          } else if (err.status === 403) {
            errorMessage = 'Sie haben keine Berechtigung, Dishes zu erstellen.';
          } else if (err.status === 400) {
            errorMessage = err.error?.error || 'Ungültige Daten. Bitte überprüfen Sie Ihre Eingabe.';
          } else if (err.status === 404) {
            errorMessage = 'Restaurant oder Kategorie nicht gefunden.';
          } else if (err.status === 413) {
            errorMessage = 'Das Bild ist zu groß. Bitte wählen Sie ein kleineres Bild.';
          } else if (err.status === 500) {
            errorMessage = 'Server-Fehler. Bitte versuchen Sie es später erneut.';
          }
          
          alert(errorMessage);
          this.cdr.detectChanges();
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/owner/dishes']);
  }
}
