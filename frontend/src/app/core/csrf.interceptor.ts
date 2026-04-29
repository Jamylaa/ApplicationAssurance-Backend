import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ne pas ajouter CSRF pour les routes publiques
  const isPublicRequest = 
    req.url.includes('/login') ||
    req.url.includes('/register') ||
    req.url.includes('/refresh');

  if (isPublicRequest) {
    return next(req);
  }

  // Obtenir le token CSRF depuis le localStorage ou un cookie
  const csrfToken = getCsrfToken();
  
  if (csrfToken) {
    // Cloner la requête et ajouter le header CSRF
    const csrfReq = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken,
        'X-CSRF-TOKEN': csrfToken
      },
      withCredentials: true // Important pour inclure les cookies
    });
    
    return next(csrfReq);
  }

  return next(req);
};

function getCsrfToken(): string | null {
  // Essayer différentes sources pour le token CSRF
  const fromMeta = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
  if (fromMeta) return fromMeta;
  
  const fromStorage = localStorage.getItem('XSRF-TOKEN') || localStorage.getItem('CSRF_TOKEN');
  if (fromStorage) return fromStorage;
  
  // Essayer de récupérer depuis les cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN' || name === 'CSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

// Fonction pour sauvegarder le token CSRF
export function saveCsrfToken(token: string): void {
  localStorage.setItem('XSRF-TOKEN', token);
  
  // Ajouter aussi dans meta tag pour les formulaires
  let meta = document.querySelector('meta[name="_csrf"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', '_csrf');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', token);
}
