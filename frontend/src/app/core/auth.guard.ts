import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  // Vérifier si l'utilisateur est authentifié
  if (token && currentUser) {
    return true;
  }
  
  console.log('❌ Accès refusé - Utilisateur non authentifié');
  router.navigate(['/auth/login']);
  return false;
};
