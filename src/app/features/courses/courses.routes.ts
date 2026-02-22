import { Routes } from '@angular/router';


export const COURSES_ROUTES: Routes = [
    {
      path: '',
      loadComponent: () => import('./pages/course-list/course-list.component').then(m => m.CourseListComponent),
        data: { breadcrumb: 'Courses' }

    },
    {
      path: ':id',
      loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
        data: { breadcrumb: 'Course Detail' }
    }
];
