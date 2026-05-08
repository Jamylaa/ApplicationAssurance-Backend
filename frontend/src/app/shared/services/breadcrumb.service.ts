import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumb$ = this.breadcrumbSubject.asObservable();

  constructor(private router: Router) {}

  setBreadcrumb(items: BreadcrumbItem[]): void {
    this.breadcrumbSubject.next(items);
  }

  // Méthodes prédéfinies pour les pages communes
  setHomeBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Accueil', url: '/dashboard' }
    ]);
  }

  setUsersBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Accueil', url: '/dashboard', icon: 'pi pi-home' },
      { label: 'Gestion', icon: 'pi pi-cog' },
      { label: 'Utilisateurs', url: '/users', icon: 'pi pi-users' }
    ]);
  }

  setProduitsBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Accueil', url: '/dashboard', icon: 'pi pi-home' },
      { label: 'Gestion', icon: 'pi pi-cog' },
      { label: 'Produits', url: '/produits', icon: 'pi pi-box' }
    ]);
  }

  setPacksBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Accueil', url: '/dashboard', icon: 'pi pi-home' },
      { label: 'Gestion', icon: 'pi pi-cog' },
      { label: 'Packs', url: '/packs', icon: 'pi pi-collection' }
    ]);
  }

  setGarantiesBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Accueil', url: '/dashboard', icon: 'pi pi-home' },
      { label: 'Gestion', icon: 'pi pi-cog' },
      { label: 'Garanties', url: '/garanties', icon: 'pi pi-shield' }
    ]);
  }

  setDashboardBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Dashboard', url: '/dashboard', icon: 'pi pi-home' }
    ]);
  }

  setAuthBreadcrumb(): void {
    this.setBreadcrumb([
      { label: 'Authentification', icon: 'pi pi-lock' }
    ]);
  }

  // Méthode générique basée sur l'URL actuelle
  updateBreadcrumbFromUrl(): void {
    const url = this.router.url;
    
    if (url.includes('/users')) {
      this.setUsersBreadcrumb();
    } else if (url.includes('/produits')) {
      this.setProduitsBreadcrumb();
    } else if (url.includes('/packs')) {
      this.setPacksBreadcrumb();
    } else if (url.includes('/garanties')) {
      this.setGarantiesBreadcrumb();
    } else if (url.includes('/dashboard')) {
      this.setDashboardBreadcrumb();
    } else if (url.includes('/auth')) {
      this.setAuthBreadcrumb();
    } else {
      this.setHomeBreadcrumb();
    }
  }

  // Nettoyer le breadcrumb
  clear(): void {
    this.breadcrumbSubject.next([]);
  }
}
