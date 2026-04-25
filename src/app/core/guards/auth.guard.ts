import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CourseService } from "../../features/courses/services/course.service";

export const courseAccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) =>{
  const auth = inject(AuthService);
  const courseService = inject(CourseService);
  const router = inject(Router);

  const courseId = route.paramMap.get('id');
  if(!courseId) return router.parseUrl('/courses');

  const course = courseService.getCourseById(courseId);

  if(!course) return router.parseUrl('/courses');

  if(course.accessLevel === 'free') return true;

  if(!auth.isLoggedIn()){
    return router.createUrlTree(['/login'], {
      queryParams: { redirect: `/courses/${courseId}`}
    })
  }
  return true;
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if(auth.isLoggedIn()) return true;
  return router.parseUrl('/login');
}

export const professorGuard: CanActivateFn = ()=>{
  const auth = inject(AuthService);
  const router = inject(Router);

  if(auth.isProfessor()) return true;
  return router.parseUrl('/');
}

export const loggedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router= inject(Router)

  if(!auth.isLoggedIn()) return true;
  return router.parseUrl('/')
}
