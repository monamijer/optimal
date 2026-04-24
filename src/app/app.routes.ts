import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { loggedInGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
      path: '',
      component: MainLayoutComponent,
      data: { breadcrumb: 'Home' },
      children: [
        {
          path: 'courses',
          loadChildren: ()=> import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES)
        }
      ]
    },
    {
      path: 'login',
      canActivate: [loggedInGuard],
      loadComponent: ()=>
        import('./features/login/login.component').then(m=> m.LoginComponent),
      data: { breadcrumb: 'Connexion' },
    },
    {
      path: 'register',
      canActivate: [loggedInGuard],
      loadComponent: () =>
        import('./features/register/register.component').then(m=> m.RegisterComponent),
      data: { breadcrumb: 'Register' }
    },
    {
      path: '**',
      redirectTo: '',
    }
];
