import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  theme = inject(ThemeService);
  layoutService = inject(LayoutService);
  toggleTheme(){
    this.theme.toggleTheme();
  }
  toggleSidebar(){
    this.layoutService.toggleSidebar();
  }
}
