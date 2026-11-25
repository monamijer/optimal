import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Sidebar state. On a course page of a wide screen (>= 992px) the sidebar is a
 * "rail" in the page that can be collapsed (choice remembered). Everywhere else
 * (home, catalogue, mobile) it is a drawer, closed by default.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly KEY = 'optimal.sidebar.collapsed';
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private router = inject(Router);

  isDesktop = signal(true);
  collapsed = signal(false);
  drawerOpen = signal(false);
  /** True outside course pages: the sidebar is then always a drawer. */
  drawerOnly = signal(false);

  /** Sidebar shown as a column in the page (course page, wide screen). */
  rail = computed(() => this.isDesktop() && !this.drawerOnly());

  /** True when the sidebar is visible, whatever the screen size. */
  sidebarOpen = computed(() => (this.rail() ? !this.collapsed() : this.drawerOpen()));
  /** True while a modal drawer covers the page. */
  modalOpen = computed(() => !this.rail() && this.drawerOpen());

  constructor() {
    if (this.isBrowser) {
      const query = window.matchMedia('(min-width: 992px)');
      this.isDesktop.set(query.matches);
      query.addEventListener('change', e => {
        this.isDesktop.set(e.matches);
        this.drawerOpen.set(false);
      });
      try {
        this.collapsed.set(localStorage.getItem(this.KEY) === '1');
      } catch { /* storage unavailable */ }
      this.drawerOnly.set(!LayoutService.isCoursePage(window.location.pathname));
      this.router.events.subscribe(e => {
        if (e instanceof NavigationEnd) {
          this.drawerOnly.set(!LayoutService.isCoursePage(e.urlAfterRedirects));
          this.drawerOpen.set(false);
        }
      });
    }
    // No background scroll while the modal drawer is open
    effect(() => {
      this.document.body.style.overflow = this.modalOpen() ? 'hidden' : '';
    });
  }

  /** /courses/<id>... is a course page; /courses alone is the catalogue. */
  static isCoursePage(url: string): boolean {
    return /\/courses\/[^/?#]+/.test(url);
  }

  toggleSidebar(): void {
    if (this.rail()) {
      const next = !this.collapsed();
      this.collapsed.set(next);
      try { localStorage.setItem(this.KEY, next ? '1' : '0'); } catch { /* ignore */ }
    } else {
      this.drawerOpen.update(v => !v);
    }
  }

  /** Closes the drawer (no effect on the desktop sidebar). */
  closeSidebar(): void {
    this.drawerOpen.set(false);
  }
}
