import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartModule, UIChart } from 'primeng/chart';
import { RouterModule } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  DashboardStatistics, 
  Produit, 
  Pack, 
  Garantie, 
  Client, 
  Souscription 
} from '../../models/produit-refactored.model';
import { ProduitRefactoredService } from '../../../core/services/produit-refactored.service';
import { formatCurrency } from '../../models/produit-refactored.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    ProgressSpinnerModule,
    ChartModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // État du composant
  loading: boolean = true;
  statistics: DashboardStatistics | null = null;
  recentProduits: Produit[] = [];
  popularPacks: Pack[] = [];
  recentSouscriptions: Souscription[] = [];
  activeClients: Client[] = [];

  // Données pour les graphiques
  chartOptions: any = {};
  produitsParTypeData: UIChart | null = null;
  evolutionMensuelleData: UIChart | null = null;
  souscriptionsParStatutData: UIChart | null = null;

  constructor(private produitService: ProduitRefactoredService) { }

  ngOnInit(): void {
    this.initializeCharts();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCharts(): void {
    // Configuration commune pour tous les graphiques
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 12
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 12
          },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    };
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Charger les statistiques
    this.loadStatistics();
    
    // Charger les données récentes
    this.loadRecentData();
    
    // Charger les données pour les graphiques
    this.loadChartData();
  }

  private loadStatistics(): void {
    // Simulation - À remplacer avec un vrai service
    setTimeout(() => {
      this.statistics = {
        totalProduits: 12,
        produitsActifs: 10,
        totalPacks: 35,
        packsActifs: 30,
        totalGaranties: 89,
        garantiesActives: 75,
        totalClients: 1250,
        clientsActifs: 1100,
        totalSouscriptions: 890,
        souscriptionsActives: 750,
        chiffreAffairesMensuel: 45680,
        chiffreAffairesAnnuel: 548160,
        produitsParType: {
          'Santé': 5,
          'Auto': 3,
          'Habitation': 2,
          'Voyage': 1,
          'Vie': 1
        },
        souscriptionsParStatut: {
          'Active': 750,
          'En attente': 80,
          'Suspendue': 30,
          'Expirée': 20,
          'Résiliée': 10
        },
        evolutionMensuelle: [
          { mois: 'Jan', chiffreAffaires: 42000, nombreSouscriptions: 85 },
          { mois: 'Fev', chiffreAffaires: 43500, nombreSouscriptions: 88 },
          { mois: 'Mar', chiffreAffaires: 45200, nombreSouscriptions: 92 },
          { mois: 'Avr', chiffreAffaires: 44800, nombreSouscriptions: 90 },
          { mois: 'Mai', chiffreAffaires: 46100, nombreSouscriptions: 95 },
          { mois: 'Jun', chiffreAffaires: 45680, nombreSouscriptions: 93 }
        ]
      };
    }, 500);
  }

  private loadRecentData(): void {
    // Simulation des produits récents
    setTimeout(() => {
      this.recentProduits = [
        {
          idProduit: '1',
          nomProduit: 'Santé Famille Premium',
          description: 'Couverture complète pour toute la famille',
          typeProduit: 'SANTE' as any,
          ageMin: 18,
          ageMax: 65,
          maladieChroniqueAutorisee: true,
          diabetiqueAutorise: true,
          actif: true,
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString(),
          prixMoyenPacks: 150
        },
        {
          idProduit: '2',
          nomProduit: 'Auto Confort',
          description: 'Assurance auto tous risques',
          typeProduit: 'AUTO' as any,
          ageMin: 18,
          ageMax: 75,
          maladieChroniqueAutorisee: false,
          diabetiqueAutorise: false,
          actif: true,
          dateCreation: new Date(Date.now() - 86400000).toISOString(),
          dateModification: new Date(Date.now() - 86400000).toISOString(),
          prixMoyenPacks: 85
        }
      ];
    }, 600);

    // Simulation des packs populaires
    setTimeout(() => {
      this.popularPacks = [
        {
          idPack: '1',
          nomPack: 'Pack Premium Santé',
          description: 'Meilleure couverture médicale',
          produitId: '1',
          prixMensuel: 180,
          dureeMinContrat: 12,
          dureeMaxContrat: 24,
          niveauCouverture: 'PREMIUM' as any,
          actif: true,
          nombreGaranties: 15,
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString(),
          nombreSouscriptions: 250
        },
        {
          idPack: '2',
          nomPack: 'Pack Auto Standard',
          description: 'Couverture automobile complète',
          produitId: '2',
          prixMensuel: 95,
          dureeMinContrat: 6,
          dureeMaxContrat: 12,
          niveauCouverture: 'STANDARD' as any,
          actif: true,
          nombreGaranties: 8,
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString(),
          nombreSouscriptions: 180
        }
      ];
    }, 700);

    // Simulation des souscriptions récentes
    setTimeout(() => {
      this.recentSouscriptions = [
        {
          idSouscription: '1',
          clientId: '1',
          packId: '1',
          produitId: '1',
          dateDebut: new Date().toISOString(),
          dateFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          statut: 'ACTIVE' as any,
          statutPaiement: 'A_JOUR' as any,
          primeMensuel: 180,
          modePaiement: 'MENSUEL' as any,
          frequencePaiement: 'MENSUEL' as any,
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        },
        {
          idSouscription: '2',
          clientId: '2',
          packId: '2',
          produitId: '2',
          dateDebut: new Date(Date.now() - 86400000).toISOString(),
          dateFin: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          statut: 'ACTIVE' as any,
          statutPaiement: 'A_JOUR' as any,
          primeMensuel: 95,
          modePaiement: 'MENSUEL' as any,
          frequencePaiement: 'MENSUEL' as any,
          dateCreation: new Date(Date.now() - 86400000).toISOString(),
          dateModification: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }, 800);

    // Fin du chargement
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  private loadChartData(): void {
    if (!this.statistics) return;

    // Graphique des produits par type
    this.produitsParTypeData = {
      type: 'doughnut',
      data: {
        labels: Object.keys(this.statistics.produitsParType),
        datasets: [{
          data: Object.values(this.statistics.produitsParType),
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            display: true,
            text: 'Répartition des produits par type',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    };

    // Graphique d'évolution mensuelle
    this.evolutionMensuelleData = {
      type: 'line',
      data: {
        labels: this.statistics.evolutionMensuelle.map(item => item.mois),
        datasets: [{
          label: 'Chiffre d\'affaires (DT)',
          data: this.statistics.evolutionMensuelle.map(item => item.chiffreAffaires),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Nombre de souscriptions',
          data: this.statistics.evolutionMensuelle.map(item => item.nombreSouscriptions),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }]
      },
      options: {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            display: true,
            text: 'Évolution mensuelle',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          ...this.chartOptions.scales,
          y: {
            ...this.chartOptions.scales.y,
            position: 'left',
            title: {
              display: true,
              text: 'Chiffre d\'affaires (DT)'
            }
          },
          y1: {
            ...this.chartOptions.scales.y,
            position: 'right',
            title: {
              display: true,
              text: 'Nombre de souscriptions'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    };

    // Graphique des souscriptions par statut
    this.souscriptionsParStatutData = {
      type: 'bar',
      data: {
        labels: Object.keys(this.statistics.souscriptionsParStatut),
        datasets: [{
          label: 'Nombre de souscriptions',
          data: Object.values(this.statistics.souscriptionsParStatut),
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#6b7280',
            '#8b5cf6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            display: true,
            text: 'Souscriptions par statut',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    };
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getStatutColor(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'active':
      case 'actif':
      case 'a_jour':
        return 'success';
      case 'en_attente':
      case 'suspendu':
      case 'en_retard':
        return 'warning';
      case 'resiliee':
      case 'resilie':
      case 'impaye':
      case 'bloque':
      case 'expirée':
        return 'danger';
      default:
        return 'info';
    }
  }

  getNiveauCouvertureColor(niveau: string): string {
    switch (niveau.toLowerCase()) {
      case 'basic':
        return 'info';
      case 'standard':
        return 'primary';
      case 'premium':
        return 'warning';
      case 'luxe':
        return 'success';
      default:
        return 'secondary';
    }
  }

  // Actions
  refreshData(): void {
    this.loadDashboardData();
  }

  exportData(): void {
    // Implémenter l'exportation des données
    console.log('Export des données du dashboard');
  }

  // Navigation
  navigateToProduits(): void {
    // Navigation vers la page des produits
    console.log('Navigation vers les produits');
  }

  navigateToPacks(): void {
    // Navigation vers la page des packs
    console.log('Navigation vers les packs');
  }

  navigateToSouscriptions(): void {
    // Navigation vers la page des souscriptions
    console.log('Navigation vers les souscriptions');
  }

  navigateToClients(): void {
    // Navigation vers la page des clients
    console.log('Navigation vers les clients');
  }
}
