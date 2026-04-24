import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "../models/user";
import { Router } from "@angular/router";

@Injectable({
    providedIn : 'root'
})
export class AuthService {
    private router = inject(Router);
    private currentUser = signal<User | null>(this.loadFromStorage());

    isLoggedIn = computed(() => this.currentUser() != null);
    isProfessor= computed(() => this.currentUser()?.role === 'PROFESSOR');
    isStudent  = computed(() => this.currentUser()?.role === 'STUDENT');
    user       = computed(() => this.currentUser());

    isAuthenticated(): boolean{
      return this.isLoggedIn();
    }

    login(email: string, password: string): boolean{
      const mockUsers: User[]= [
        { id: '1', name: 'Prof Lerba', email: 'lerba@opt.com', role: 'PROFESSOR' },
        { id: '2', name: 'Joyce Julienne', email: 'joy@opt.com', role: 'STUDENT'},
      ];
      const found = mockUsers.find(u => u.email === email);
      if(found){
        this.currentUser.set(found);
        localStorage.setItem('user', JSON.stringify(found));
        return true;
      }
      return false;
    }
    logout(){
      this.currentUser.set(null);
      localStorage.removeItem('user');
    }
    private loadFromStorage(): User| null{
      try{
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch{
        return null;
      }
    }

}
