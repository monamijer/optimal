import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../../services/auth.service";

export const authGuard: CanActivateFn = () =>{
  const auth = inject(AuthService);
  const router = inject(Router);

  if(!auth.isLoggedIn()){
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const professorGuard: CanActivateFn = ()=>{
  const auth = inject(AuthService);
  const router = inject(Router);

  if(auth.isProfessor()) return true;
  router.navigate(['/']);
  return false;
}

export const loggedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router= inject(Router)

  if(!auth.isLoggedIn()) return true;
  router.navigate(['/']);
  return false
}
