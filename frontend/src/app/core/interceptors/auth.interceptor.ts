import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne pas modifier les requêtes qui ont déjà un Content-Type (ex: FormData)
    const hasContentType = req.headers.has('Content-Type');
    
    // Cloner la requête avec les headers de base
    let authReq = req.clone();
    
    // Ajouter Content-Type seulement si ce n'est pas déjà présent
    if (!hasContentType && !(req.body instanceof FormData)) {
      authReq = authReq.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Ajouter le header d'autorisation si le token existe
    const token = this.authService.getToken();
    if (token) {
      authReq = authReq.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq);
  }
}
