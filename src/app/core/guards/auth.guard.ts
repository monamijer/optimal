import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../../services/auth.service";

export const authGuard: CanActivateFn = () =>{
  const auth = inject(AuthService);
  const router = inject(Router);

  if(!auth.isAuthenticated()){
    router.navigate(['/login']);
    return false;
  }
  return true;
};
export const loggedInGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): boolean | UrlTree =>{
  //const userService = inject(UserService?);
  const router = inject(Router);

  //return userService.isLoggedIn() || router.parseUrl('/login');
}
