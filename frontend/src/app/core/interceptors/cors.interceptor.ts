import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const corsInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // Cloner la requête et ajouter les headers CORS
  const corsReq = req.clone({
    setHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Max-Age': '86400'
    }
  });

  return next(corsReq);
};
