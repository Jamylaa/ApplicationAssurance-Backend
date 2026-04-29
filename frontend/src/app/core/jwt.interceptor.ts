import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Définir les routes publiques (pas besoin de token)
  const isPublicRequest =
    req.url.includes('/login') ||
    req.url.includes('/register') ||
    req.url.includes('/refresh') ||
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/admins/createAdmin') ||
    req.url.includes('/eureka') ||
    req.url.includes('/actuator') ||
    req.url.includes('/api/ai/') ||  // AI service routes
    req.url.includes('/api/recommendation-chat/') ||  // AI chat routes
    req.url.includes('/api/admin-chat/') ||  // AI admin chat
    req.url.includes('/api/google/');  // Google API routes

  let authReq = req;
  
  // Préparer les headers à ajouter
  const headersToAdd: { [key: string]: string } = {};
  
  // Ajouter le header Authorization pour toutes les requêtes privées
  if (token && !isPublicRequest) {
    headersToAdd['Authorization'] = `Bearer ${token}`;
  }
  
  // Ajouter Content-Type uniquement pour les requêtes avec corps qui n'en ont pas déjà
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && 
      !req.headers.has('Content-Type')) {
    headersToAdd['Content-Type'] = 'application/json';
  }
  
  // Cloner la requête uniquement si des headers doivent être ajoutés
  if (Object.keys(headersToAdd).length > 0) {
    authReq = req.clone({
      setHeaders: headersToAdd
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs 401 avec refresh token
      if (error.status === 401 && !isPublicRequest && token) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            if (res && res.token) {
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.token}`
                }
              });
              return next(newAuthReq);
            }
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      
      // Gérer les erreurs 403 (permissions)
      if (error.status === 403) {
        if (!environment.production) {
          console.error('Erreur 403 - Permission refusée:', error);
          console.error('URL demandée:', error.url);
          console.error('Méthode:', authReq.method);
          console.error('Est route publique:', isPublicRequest);
          console.error('Token présent:', !!token);
        }
        // Pas de retry automatique pour éviter les boucles infinies
        return throwError(() => error);
      }
      
      // Gérer les erreurs 500 (erreurs serveur internes)
      if (error.status === 500) {
        if (!environment.production) {
          console.error('Erreur 500 - Erreur serveur interne:', error);
          console.error('URL demandée:', error.url);
          console.error('Méthode:', authReq.method);
        }
        return throwError(() => error);
      }
      
      // Gérer les erreurs CORS (status 0)
      if (error.status === 0) {
        if (!environment.production) {
          console.error('Erreur CORS - status 0 (Unknown Error)');
          console.error('URL demandée:', error.url);
          console.error('Méthode:', authReq.method);
        }
        return throwError(() => error);
      }
      
      return throwError(() => error);
    })
  );
};
