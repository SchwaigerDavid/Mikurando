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
      const email = this.firstFormGroup.value.email ?? '';
      const firstname = this.firstFormGroup.value.firstname ?? '';
      const lastname = this.firstFormGroup.value.lastname ?? '';

      const address = this.secondFormGroup.value.address ?? '';
      const areacode = this.secondFormGroup.value.areacode ?? '';

      const password = this.thirdFormGroup.value.password ?? '';
      const role = (this.fourthFormGroup.value.role as 'CUSTOMER' | 'OWNER' | 'MANAGER') ?? 'CUSTOMER';
      if(this.authService.register(email,password,role,address,areacode,firstname,lastname)) {
        this.authService.login(email,password)
        const User:string =localStorage.getItem("user") ?? " ";
        const myUser:{
          userId: number;
          email: string;
          role: 'CUSTOMER' | 'OWNER' | 'MANAGER';
          warnings: number;
        } =JSON.parse(User);
        if(myUser.role=="CUSTOMER"){

        }else if(myUser.role=="MANAGER"){

        }else if(myUser.role=="OWNER"){
          this.router.navigateByUrl('/ownerdash');
        }
      }
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
