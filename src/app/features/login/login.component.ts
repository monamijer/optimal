import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    private readonly fb     = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route  = inject(ActivatedRoute)
    private readonly auth   = inject(AuthService)

    protected readonly error = signal('');

    protected readonly userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
    })

    fillDemo(email: string): void{
      this.userForm.patchValue({email, password: 'jer123'})
    }
    protected login(): void{
      if(this.userForm.invalid) return;
      const {email, password } = this.userForm.value;
      const success = this.auth.login(email!, password!);

      if(success){
        const redirect = this.route.snapshot.queryParams['redirect'] || '/courses'
        this.router.navigateByUrl(redirect);
      }else{
        this.error.set('Email ou mot de mot de passe incorrect.');
      }
    }
}
