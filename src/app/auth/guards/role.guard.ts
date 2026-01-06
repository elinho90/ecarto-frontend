import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../shared/enums/role.enum';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  
  const allowedRoles = route.data?.['allowedRoles'] as Role[];
  const userStr = localStorage.getItem('current_user');
  
  if (!userStr) {
    router.navigate(['/login']);
    return false;
  }
  
  const user = JSON.parse(userStr);
  
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  if (allowedRoles.includes(user.role)) {
    return true;
  }
  
  snackBar.open('Accès refusé : permissions insuffisantes', 'Fermer', {
    duration: 3000,
    panelClass: ['error-snackbar']
  });
  
  router.navigate(['/dashboard']);
  return false;
};