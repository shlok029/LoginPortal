import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) return router.createUrlTree(['/login']);
  return route.data['role'] === authService.getRole()
    ? true
    : router.createUrlTree(['/access-denied']);
};