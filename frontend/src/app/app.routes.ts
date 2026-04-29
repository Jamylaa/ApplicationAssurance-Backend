import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pages', loadChildren: () => import('./pages/pages.routes').then((m) => m.PAGES_ROUTES), canActivate: [authGuard] },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
