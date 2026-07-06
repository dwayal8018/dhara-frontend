import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Reads route.data['permission'] and checks it against the logged-in user.
 * Routes without data.permission are allowed for any authenticated user.
 * Unauthorized users are redirected to /dashboard (they are logged in, just restricted).
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth      = inject(AuthService);
  const router    = inject(Router);
  const required  = route.data?.['permission'] as string | undefined;

  if (auth.hasPermission(required)) return true;

  // Logged in but no permission → send to dashboard
  return router.createUrlTree(['/dashboard']);
};
