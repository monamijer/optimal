import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  protected readonly fb = inject(FormBuilder);

  protected readonly userForm = this.fb.group({
    username: '',
    email: '',
    password: ''

  });
  protected register(): void{
    console.log(this.userForm.value)
  }
}
