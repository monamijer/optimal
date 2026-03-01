import { inject, Injectable, signal } from "@angular/core";
import { Human } from "../models/human";
import { Router } from "@angular/router";

@Injectable({
    providedIn : 'root'
})
export class AuthService {
    private router = inject(Router);
    user = signal<{ id: string; role: 'student' | 'teacher' } | null>(null);

    login(id: string, role: 'student'| 'teacher'){
      this.user.set({ id, role });
      this.router.navigate(['/courses']);
    }
    logout(){
      this.user.set(null);
      this.router.navigate(['/login']);
    }
    isAuthenticated(){
      return this.user() !== null;
    }
}
