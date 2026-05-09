import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { jwtInterceptor } from './core/jwt.interceptor';
import { csrfInterceptor } from './core/csrf.interceptor';
import { tap, catchError } from 'rxjs/operators';

import { ConfirmationService, MessageService } from 'primeng/api';

import { routes } from './app.routes';

const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  const router = inject(Router);

  return next(req).pipe(
    tap(() => {
      // Request completed successfully
    }),
    catchError((error: any) => {

      // Handle different error types
      if (error.status === 401) {
        // Check if it's a token expiration message
        const errorMessage = error.error?.message || error.message || '';
        if (errorMessage.includes('expiré') || errorMessage.includes('expired')) {
          // Token expiré - Redirection vers login
        }
        
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page
        router.navigate(['/login']);
      }

      // Transform error to consistent format
      const transformedError = {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        timestamp: new Date().toISOString(),
        details: error.error || null,
        type: getErrorType(error.status),
        isServerError: error.status >= 500,
        requiresRetry: error.status >= 500 && error.status < 600
      };

      throw transformedError;
    })
  );
};

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
    provideHttpClient(withInterceptors([jwtInterceptor, csrfInterceptor, errorInterceptor])),
    provideAnimations(), ConfirmationService, MessageService
  ]
};