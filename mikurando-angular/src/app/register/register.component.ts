import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../shared/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: 'register.component.html',
  styleUrl: 'register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['CUSTOMER' as 'CUSTOMER' | 'OWNER', [Validators.required]],
    name: ['', [Validators.required]],
    surname: ['', [Validators.required]],
    address: [''],
    area_code: [''],
  });

  submit() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    (this.auth as any)
      .register({
        email: String(v.email),
        password: String(v.password),
        role: v.role!,
        name: String(v.name),
        surname: String(v.surname),
        address: v.address ? String(v.address) : undefined,
        area_code: v.area_code ? String(v.area_code) : undefined,
      })
      .subscribe({
        next: () => {
          this.snack.open('Registration successful. Please log in.', 'Close', { duration: 2500 });
          this.router.navigateByUrl('/login');
        },
        error: (err: any) => {
          const msg = err?.error?.error ?? 'Registration failed.';
          this.snack.open(msg, 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
        },
      });
  }
}
