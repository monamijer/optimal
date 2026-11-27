import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TPipe } from '../../core/i18n/t.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private readonly document = inject(DOCUMENT);

  readonly year = new Date().getFullYear();

  toTop(): void {
    this.document.defaultView?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
