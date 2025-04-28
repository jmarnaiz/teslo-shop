import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const notAuthenticatedGuard: CanMatchFn = async (route, segments) => {
  console.log('notAuthenticatedGuard');

  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());

  /**
   * Si hago const isAuthenticated = authService.authStatus() me va a devolver
   * 'checking' porque es el valor al que se inicializa. Por eso debemos esperar
   * a obtener un valor válido, y eso se consigue con el 'firstValuefrom'
   */
  console.log('Guard');
  console.log('isAuthenticated?: ', isAuthenticated);

  // Debe estar NO autenticado para dejarlo pasar
  if (isAuthenticated) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};
