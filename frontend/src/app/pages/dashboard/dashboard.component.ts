import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GestionUserService } from '../../services/gestion-user.service';
import { GestionProduitService } from '../../services/gestion-produit.service';
import { GestionSouscriptionService } from '../../services/gestion-souscription.service';
import { RecommendationService } from '../../services/recommendation.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  stats = {
    totalUsers: 0,
    totalProduits: 0,
    totalSouscriptions: 0,
    totalRecommendations: 0
  };
  loading = true;

  constructor(
    private router: Router,
    private userService: GestionUserService,
    private produitService: GestionProduitService,
    private souscriptionService: GestionSouscriptionService,
    private recommendationService: RecommendationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadStats();
  }

  loadUserData(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  loadStats(): void {
    this.loading = true;
    
    Promise.all([
      this.userService.getAllUsers().toPromise().catch(() => []),
      this.produitService.getAllProduits().toPromise().catch(() => []),
      this.souscriptionService.getAllSouscriptions().toPromise().catch(() => []),
      this.recommendationService.getAllRecommendations().toPromise().catch(() => [])
    ]).then(([users, produits, souscriptions, recommendations]) => {
      this.stats = {
        totalUsers: users?.length || 0,
        totalProduits: produits?.length || 0,
        totalSouscriptions: souscriptions?.length || 0,
        totalRecommendations: recommendations?.length || 0
      };
    }).finally(() => {
      this.loading = false;
    });
  }

  navigateToUsers(): void {
    this.router.navigate(['/pages/users']);
  }

  navigateToProduits(): void {
    this.router.navigate(['/pages/produits']);
  }

  navigateToSouscriptions(): void {
    this.router.navigate(['/pages/souscriptions']);
  }

  navigateToRecommendations(): void {
    this.router.navigate(['/pages/recommendations']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}