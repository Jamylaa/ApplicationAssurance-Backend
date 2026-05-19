import { ApplicationConfig, inject } from '@angular/core';
import {provideRouter,Router} from '@angular/router';
import {provideHttpClient,withInterceptors,HttpInterceptorFn} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService,MessageService} from 'primeng/api';

import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { routes } from './app.routes';

import {  provideKeycloak} from 'keycloak-angular';

import { authInterceptor } from './core/auth.interceptor';


// ERROR INTERCEPTOR
const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  return next(req).pipe(

    catchError((error: any) => {

      if (error.status === 401) {
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};


// APP CONFIG
export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),

    provideAnimations(),

    ConfirmationService,
    MessageService,

    provideKeycloak({

      config: {
        url: 'http://localhost:9090',
        realm: 'vermeg-realm',
        clientId: 'frontend-client'
      },

      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      }
    })
  ]
};