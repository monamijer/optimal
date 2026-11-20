import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * Sidebar state. Desktop (>= 992px): the sidebar is part of the page and can be
 * collapsed (choice remembered). Mobile/tablet: it is a drawer, closed by default.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly KEY = 'optimal.sidebar.collapsed';
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  isDesktop = signal(true);
  collapsed = signal(false);
  drawerOpen = signal(false);

  /** True when the sidebar is visible, whatever the screen size. */
  sidebarOpen = computed(() => (this.isDesktop() ? !this.collapsed() : this.drawerOpen()));
  /** True while a modal drawer covers the page. */
  modalOpen = computed(() => !this.isDesktop() && this.drawerOpen());

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
    }
    // No background scroll while the modal drawer is open
    effect(() => {
      this.document.body.style.overflow = this.modalOpen() ? 'hidden' : '';
    });
  }

  toggleSidebar(): void {
    if (this.isDesktop()) {
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
