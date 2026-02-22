import { Component } from '@angular/core';
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
  constructor(
    private themeService: ThemeService,
    private layoutService: LayoutService,
  ){}
  toggleTheme(){
    this.themeService.toggleTheme();
  }
  toggleSidebar(){
    this.layoutService.toggleSidebar();
  }
}
