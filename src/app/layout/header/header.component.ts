import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { QuizReviewService } from '../../core/services/quiz-review.service';
import { SearchService } from '../../features/search/search.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  i18n = inject(I18nService);
  theme = inject(ThemeService);
  layoutService = inject(LayoutService);
  auth      = inject(AuthService);
  router    = inject(Router);
  searchService = inject(SearchService);
  private quizReview = inject(QuizReviewService);
  reviewDue = computed(() => this.quizReview.due().length);

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
