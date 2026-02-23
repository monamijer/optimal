import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
    private currentTheme: 'light' | 'dark' = 'light';
  constructor() {
    this.initTheme();
  }
  private initTheme(){
    const saved = localStorage.getItem('theme') as 'light'| 'dark'| null;
    if(saved){
      this.setTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark': 'light');
  }
  toggleTheme(){
    const html = document.documentElement;
    const current = html.getAttribute('data-bs-theme');
    html.setAttribute(
      'data-bs-theme',
      current === 'dark' ? 'light' : 'dark'
    );
    //const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    //this.setTheme(newTheme);
  }
  setTheme(theme: 'light' | 'dark'){
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }
  get theme(): 'light' | 'dark'{
    return this.currentTheme;
  }
}
