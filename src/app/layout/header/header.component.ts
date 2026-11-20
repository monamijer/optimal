import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  theme = inject(ThemeService);
  layoutService = inject(LayoutService);
  auth      = inject(AuthService);
  router    = inject(Router);

  toggleTheme(): void{
    this.theme.toggleTheme();
  }
  toggleSidebar(): void{
    this.layoutService.toggleSidebar();
  }
  search(event: Event, term: string): void{
    event.preventDefault();
    const q = term.trim();
    this.router.navigate(['/courses'], { queryParams: q ? { q } : {} });
  }
  logout(): void{
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
