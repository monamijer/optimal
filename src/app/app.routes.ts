import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

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
    }
];
