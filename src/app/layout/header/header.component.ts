import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
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
  logout(): void{
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
