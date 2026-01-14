import { Component } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {FormGroup, FormControl} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-order-reception',
  imports: [
    CommonModule,
    MatCardModule, //
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './order-reception.html',
  styleUrl: './order-reception.scss',
})
export class OrderReception {

  orders = [
    { id: 1, customer: 'Max Mustermann', status: 'NEW', total: 24.90 },
    { id: 2, customer: 'Lisa Beispiel', status: 'PREPARING', total: 18.50 }
  ];

}

