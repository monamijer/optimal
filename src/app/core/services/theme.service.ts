import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
    private document = inject(DOCUMENT);
    private plateformId = inject(PLATFORM_ID)

    theme = signal<'light' | 'dark'>('light');
  constructor() {
    this.initTheme();
  }
  initTheme(){
    if(!isPlatformBrowser(this.plateformId)) return;
    const saved = localStorage.getItem('theme');
    if(saved === 'light' || saved === 'dark'){
      this.theme.set(saved);
    }else{
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme.set(prefersDark ? 'dark' : 'light');
    }
    this.applyTheme();
  }
  toggleTheme(){
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
    if(isPlatformBrowser(this.plateformId)){
      localStorage.setItem('theme', newTheme);
      this.applyTheme();
    }
  }
  applyTheme(){
    document.documentElement.setAttribute('data-bs-theme', this.theme());
  }

}
