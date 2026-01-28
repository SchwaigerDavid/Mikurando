import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {AuthService} from '../shared/auth/auth.service';
import { RouterLink, Router } from '@angular/router';

/**
 * @title Stepper overview
 */
@Component({
  selector: 'app-register',
  templateUrl: 'register.component.html',
  styleUrl: 'register.component.css',
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,

    MatRadioModule,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  constructor(private authService: AuthService, private router: Router){}
  firstFormGroup = this._formBuilder.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    address: [''],
    areacode: [''],
  });
  thirdFormGroup = this._formBuilder.group({
    password: ['', Validators.required],
  });
  fourthFormGroup = this._formBuilder.group({
    role: ['', Validators.required],
  });
  fithFormGroup = this._formBuilder.group({
    profilePic: ['', Validators.required],
  });

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  fileName = '';

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      
      // Lese die Datei als Base64-String
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.fithFormGroup.patchValue({ profilePic: base64String as any });
      };
      reader.readAsDataURL(file);
    }
  }
  done(){
    if (
      this.firstFormGroup.valid &&
      this.thirdFormGroup.valid &&
      this.fourthFormGroup.valid
    ) {
      const email = this.firstFormGroup.value.email ?? '';
      const firstname = this.firstFormGroup.value.firstname ?? '';
      const lastname = this.firstFormGroup.value.lastname ?? '';

      const address = this.secondFormGroup.value.address ?? '';
      const areacode = this.secondFormGroup.value.areacode ?? '';

      const password = this.thirdFormGroup.value.password ?? '';
      const role = (this.fourthFormGroup.value.role as 'CUSTOMER' | 'OWNER' | 'MANAGER') ?? 'CUSTOMER';
      const profilePic = this.fithFormGroup.value.profilePic as string ?? '';
      
      // Registrierung durchführen
      this.authService.register(email, password, role, address, areacode, firstname, lastname, profilePic).subscribe({
        next: (response) => {
          console.log('Registrierung erfolgreich:', response);
          
          // Nach erfolgreicher Registrierung automatisch einloggen
          this.authService.login(email, password).subscribe({
            next: (loginResponse) => {
              console.log('Login erfolgreich:', loginResponse);
              
              // Weiterleitung basierend auf Rolle
              const user = this.authService.user();
              if (user?.role === 'CUSTOMER') {
                this.router.navigateByUrl('/restaurants');
              } else if (user?.role === 'MANAGER') {
                this.router.navigateByUrl('/home');
              } else if (user?.role === 'OWNER') {
                this.router.navigateByUrl('/ownerdash');
              }
            },
            error: (loginErr) => {
              console.error('Login nach Registrierung fehlgeschlagen:', loginErr);
              alert('Konto wurde erstellt, aber Login fehlgeschlagen. Bitte manuell einloggen.');
            }
          });
        },
        error: (err) => {
          // Fehlerbehandlung basierend auf dem Statuscode
          if (err.status === 409) {
            alert('Diese E-Mail-Adresse ist bereits registriert.');
          } else if (err.status === 500) {
            alert('Ein interner Serverfehler ist aufgetreten. Bitte später versuchen.');
          } else if (err.status === 413) {
            alert('Das Profilbild ist zu groß. Bitte wählen Sie ein kleineres Bild.');
          } else {
            alert('Verbindung zum Server fehlgeschlagen.');
          }
          console.error('Registrierungsfehler:', err);
        }
      });
    }

  }
  reset(){
    this.firstFormGroup.reset();
    this.thirdFormGroup.reset();
    this.fourthFormGroup.reset();
    this.secondFormGroup.reset();
    this.fithFormGroup.reset();
  }
  isLinear = false;
}
