import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { RouterLink } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth.service';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatSnackBarModule,
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,      // Für den schicken Rahmen
    MatFormFieldModule, // Für das Material-Design-Layout der Inputs
    MatInputModule,     // Für das eigentliche Eingabefeld
    MatButtonModule     // Für den Material-Button
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private authService: AuthService,private snackBar: MatSnackBar) { }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username!, password!).subscribe({
        next: data => {
          this.snackBar.open('Access granted', 'Close', {
            duration: 5000 // Optional für rotes Design
          });
        },
        error: (err) => {
          this.snackBar.open('Something went wrong', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'] // Optional für rotes Design
          });
        }
      });
    }
  }
}
