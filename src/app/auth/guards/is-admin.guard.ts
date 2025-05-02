import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const isAdminGuard: CanMatchFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await firstValueFrom(authService.checkAuthStatus());

  return authService.isAdmin();
  // const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());

  // if (isAuthenticated && authService.isAdmin()) {
  //   return true;
  // }

  // router.navigateByUrl('/');
  // return false;
};
