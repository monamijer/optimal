import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  userForm = this.fb.group({
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  passwordMismatch = computed(() => {
    const p  = this.userForm.get('password')?.value;
    const cp = this.userForm.get('confirmPassword')?.value;
    return cp && p !== cp;
  });

  register(): void {
    if (this.userForm.invalid || this.passwordMismatch()) return;
 
    console.log('Inscription :', this.userForm.value);
    this.router.navigate(['/login']);
  }
}
