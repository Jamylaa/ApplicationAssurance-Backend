import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { jwtInterceptor } from './core/jwt.interceptor';
import { csrfInterceptor } from './core/csrf.interceptor';
import { enumMappingInterceptor } from './core/interceptors/enum-mapping.interceptor';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';

// Functional error interceptor
const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  return next(req).pipe(
    tap(event => {
      if (event.type === 4) { // HttpResponse
        const duration = Date.now() - startTime;
        console.log(`✅ [${req.method}] ${req.urlWithParams} - ${event.status} (${duration}ms)`);
      }
    }),
    catchError((error: any) => {
      const duration = Date.now() - startTime;
      console.error(`❌ [${req.method}] ${req.urlWithParams} - ${error.status} (${duration}ms)`, error);

      // Handle different error types
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('role');
        // Navigate to login would need Router injection here
      }

      // Transform error to consistent format
      const transformedError = {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        timestamp: new Date().toISOString(),
        message: getErrorMessage(error),
        details: error.error || null,
        type: getErrorType(error.status),
        isServerError: error.status >= 500,
        requiresRetry: error.status >= 500 && error.status < 600
      };

      throw transformedError;
    })
  );
};

function getErrorMessage(error: any): string {
  if (error.error?.message) {
    return error.error.message;
  } else if (error.error?.error) {
    return error.error.error;
  } else if (typeof error.error === 'string') {
    return error.error;
  } else if (error.message) {
    return error.message;
  }

  switch (error.status) {
    case 400:
      return 'Requête invalide - veuillez vérifier vos données';
    case 401:
      return 'Accès non autorisé - veuillez vous connecter';
    case 403:
      return 'Accès interdit - permissions insuffisantes';
    case 404:
      return 'Ressource non trouvée';
    case 409:
      return 'Conflit de données - la ressource existe déjà';
    case 422:
      return 'Données non valides - veuillez vérifier le formulaire';
    case 500:
      return 'Erreur serveur interne - Le service est temporairement indisponible, veuillez réessayer dans quelques instants';
    case 502:
      return 'Service indisponible - maintenance en cours';
    case 503:
      return 'Service temporairement indisponible';
    case 504:
      return 'Délai d\'attente dépassé - veuillez réessayer';
    default:
      return `Erreur ${error.status}: ${error.statusText || 'Erreur inconnue'}`;
  }
}

function getErrorType(status: number): string {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status >= 500) return 'SERVER_ERROR';
  if (status >= 400) return 'CLIENT_ERROR';
  return 'UNKNOWN';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, csrfInterceptor, enumMappingInterceptor, errorInterceptor])),
    provideAnimations(),
    MessageService,
    ConfirmationService
  ]
};
