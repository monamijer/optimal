import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { loggedInGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
      path: '',
      component: MainLayoutComponent,
      data: { breadcrumb: 'crumb.home' },
      children: [
        {
          path: '',
          pathMatch: 'full',
          loadComponent: ()=>
            import('./features/home/home.component').then(m => m.HomeComponent),
        },
        {
          path: 'backup',
          data: { breadcrumb: 'crumb.backup' },
          loadComponent: () => import('./features/backup/backup.component').then(m => m.BackupComponent),
        },
        {
          path: 'notebook',
          data: { breadcrumb: 'crumb.notebook' },
          loadComponent: () => import('./features/notebook/notebook.component').then(m => m.NotebookComponent),
        },
        {
          path: 'review',
          data: { breadcrumb: 'crumb.review' },
          loadComponent: () => import('./features/review/review.component').then(m => m.ReviewComponent),
        },
        {
          path: 'courses',
          data: { breadcrumb: 'crumb.courses' },
          loadChildren: ()=> import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES)
        }
      ]
    },
    {
      path: 'login',
      canActivate: [loggedInGuard],
      loadComponent: ()=>
        import('./features/login/login.component').then(m=> m.LoginComponent),
      data: { breadcrumb: 'crumb.login' },
    },
    {
      path: 'register',
      canActivate: [loggedInGuard],
      loadComponent: () =>
        import('./features/register/register.component').then(m=> m.RegisterComponent),
      data: { breadcrumb: 'crumb.register' }
    },
    {
      path: '**',
      loadComponent: ()=>
        import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    }
];
