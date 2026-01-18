import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../shared/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatSnackBarModule,
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) { }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email!, password!).subscribe({
        next: () => {
          const warnings = this.authService.getWarningsCount();
          if (this.authService.shouldShowWarningsPopup()) {
            this.snackBar.open(
              warnings === 1 ? 'You have 1 warning on your account.' : `You have ${warnings} warnings on your account.`,
              'OK',
              { duration: 6000 },
            );
            this.authService.markWarningsPopupShown();
          } else {
            this.snackBar.open('Access granted', 'Close', { duration: 1500 });
          }

          this.router.navigateByUrl('/home');
        },
        error: () => {
          this.snackBar.open('Invalid email or password', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
