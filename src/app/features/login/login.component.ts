import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);

    protected readonly userForm = this.fb.group({
      username: '',
      email: '',
      password: ''
    })

    protected register(): void{
      console.log(`the users values is ${this.userForm.value}`)
    }
}
