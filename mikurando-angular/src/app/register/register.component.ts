import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';

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
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  constructor(private authService: AuthService){}
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
    profilePic: [File, Validators.required],
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
      // Hier kannst du den Wert in dein fithFormGroup schreiben
      this.fithFormGroup.patchValue({ profilePic: File });
    }
  }
  done(){
    if (
      this.firstFormGroup.valid &&
      this.thirdFormGroup.valid &&
      this.fourthFormGroup.valid
    ) {
      const{firstname,lastname,email}=this.firstFormGroup.value;
      const{address,areacode}=this.secondFormGroup.value;
      const{password}=this.thirdFormGroup.value;
      const {role}=this.fourthFormGroup.value;
      this.authService.register(email,password,role,address,areacode,firstname,lastname);

    }
  }
  isLinear = false;
}
