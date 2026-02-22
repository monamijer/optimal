import { Component, inject } from '@angular/core';
import { Breadcrumb, BreadcrumbService } from '../../core/services/breadcrumb.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
    private router = inject(Router)
    breadcrumbs = inject(BreadcrumbService);


    crumbs: Breadcrumb[]=
      this.breadcrumbs.build(this.router.routerState.snapshot.root);
}
