import { Routes } from '@angular/router';

export const OFFERS_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/offers-dashboard.component').then((m) => m.OffersDashboardComponent)
  },
    {
    path: 'configuration',
    loadComponent: () =>
      import('./pack-configuration/pack-configuration.component').then((m) => m.PackConfigurationComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
