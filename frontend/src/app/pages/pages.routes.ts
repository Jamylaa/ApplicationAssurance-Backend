import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'produits',
    loadComponent: () => import('./produits/produits.component').then(m => m.ProduitsComponent)
  },
  {
    path: 'souscriptions',
    loadComponent: () => import('./souscriptions/souscriptions.component').then(m => m.SouscriptionsComponent)
  },
  {
    path: 'recommendations',
    loadComponent: () => import('./recommendations/recommendations.component').then(m => m.RecommendationsComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
