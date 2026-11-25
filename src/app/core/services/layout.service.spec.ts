import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    service = TestBed.inject(LayoutService);
  });

  it('collapses and restores the sidebar rail of a course page', () => {
    service.isDesktop.set(true);
    service.drawerOnly.set(false);
    expect(service.sidebarOpen()).toBeTrue();
    service.toggleSidebar();
    expect(service.sidebarOpen()).toBeFalse();
    expect(localStorage.getItem('optimal.sidebar.collapsed')).toBe('1');
    service.toggleSidebar();
    expect(service.sidebarOpen()).toBeTrue();
  });

  it('opens the mobile drawer as a modal and closes it', () => {
    service.isDesktop.set(false);
    expect(service.sidebarOpen()).toBeFalse();
    service.toggleSidebar();
    expect(service.modalOpen()).toBeTrue();
    service.closeSidebar();
    expect(service.modalOpen()).toBeFalse();
  });

  it('locks background scroll only while the modal drawer is open', () => {
    service.isDesktop.set(false);
    service.toggleSidebar();
    TestBed.flushEffects();
    expect(document.body.style.overflow).toBe('hidden');
    service.closeSidebar();
    TestBed.flushEffects();
    expect(document.body.style.overflow).toBe('');
  });

  it('uses a drawer, even on a wide screen, outside course pages', () => {
    service.isDesktop.set(true);
    service.drawerOnly.set(true);
    expect(service.rail()).toBeFalse();
    expect(service.sidebarOpen()).toBeFalse();
    service.toggleSidebar();
    expect(service.modalOpen()).toBeTrue();
  });

  it('tells course pages from the catalogue', () => {
    expect(LayoutService.isCoursePage('/courses/algorithms')).toBeTrue();
    expect(LayoutService.isCoursePage('/optimal/courses/algorithms#binary-search')).toBeTrue();
    expect(LayoutService.isCoursePage('/courses')).toBeFalse();
    expect(LayoutService.isCoursePage('/courses?q=sql')).toBeFalse();
    expect(LayoutService.isCoursePage('/')).toBeFalse();
  });
});
