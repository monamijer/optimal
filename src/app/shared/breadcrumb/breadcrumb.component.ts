import { Component, inject } from '@angular/core';
import { Breadcrumb, BreadcrumbService } from '../../core/services/breadcrumb.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  private router = inject(Router);
  private breadcrumbService = inject(BreadcrumbService);

  // ✅ Se recalcule à chaque changement de route
  crumbs = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.breadcrumbService.build(this.router.routerState.snapshot.root))
    ),
    { initialValue: this.breadcrumbService.build(this.router.routerState.snapshot.root) }
  );
}