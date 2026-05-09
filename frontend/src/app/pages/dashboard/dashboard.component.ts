import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { GestionProduitService } from '../../services/gestion-produit.service';
import { GestionUserService } from '../../services/gestion-user.service';
import { ThemeService } from '../../core/theme.service';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    ToastModule,
    ProgressSpinnerModule,
    ButtonModule,
    CardModule,
    ChartModule,
    CommonModule
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  today = new Date();
  stats = {
    totalUsers: 0,
    totalProduits: 0,
    totalPacks: 0,
    totalGaranties: 0
  };

  barChartData: any;
  pieChartData: any;
  lineChartData: any;
  polarChartData: any;

  chartOptions: any;
  pieChartOptions: any;
  polarOptions: any;

  loading = true;
  private themeSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly userService: GestionUserService,
    private readonly produitService: GestionProduitService,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadStats();

    this.themeSubscription = this.themeService.theme$.subscribe(() => {
      setTimeout(() => {
        if (!this.loading && this.barChartData) {
          this.initChartOptions();
          
          this.chartOptions = { ...this.chartOptions };
          this.pieChartOptions = { ...this.pieChartOptions };
          this.polarOptions = { ...this.polarOptions };

          const documentStyle = getComputedStyle(document.documentElement);
          const surfaceColor = documentStyle.getPropertyValue('--app-surface').trim() || '#ffffff';
          
          if (this.pieChartData?.datasets?.[0]) {
            this.pieChartData.datasets[0].borderColor = surfaceColor;
            this.pieChartData.datasets[0].hoverBorderColor = surfaceColor;
            this.pieChartData = { ...this.pieChartData };
          }
          if (this.polarChartData?.datasets?.[0]) {
            this.polarChartData.datasets[0].borderColor = surfaceColor;
            this.polarChartData = { ...this.polarChartData };
          }
          if (this.lineChartData?.datasets?.[0]) {
            this.lineChartData.datasets[0].pointBorderColor = surfaceColor;
            this.lineChartData = { ...this.lineChartData };
          }
        }
      }, 50);
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    // Fetching variables for dark/light mode adaptation
    const textColor = documentStyle.getPropertyValue('--app-text').trim() || '#334155';
    const textColorSecondary = documentStyle.getPropertyValue('--app-text-muted').trim() || '#64748b';
    const surfaceBorder = documentStyle.getPropertyValue('--app-border-light').trim() || '#f1f5f9';
    const surfaceColor = documentStyle.getPropertyValue('--app-surface').trim() || '#ffffff';

    const commonTooltip = {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleFont: { size: 12, family: 'Plus Jakarta Sans', weight: '600' },
      bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
      padding: 12,
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 6
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { display: false },
        tooltip: commonTooltip
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { family: 'Inter', weight: 500, size: 12 } },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          ticks: { color: textColorSecondary, font: { family: 'Inter', size: 12 }, padding: 10 },
          grid: { color: surfaceBorder, drawBorder: false, borderDash: [5, 5] },
          border: { display: false }
        }
      },
      animation: { duration: 2000, easing: 'easeOutQuart' }
    };

    this.pieChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        legend: {
          position: 'right',
          labels: { 
            usePointStyle: true, color: textColor,
            font: { family: 'Inter', weight: 500, size: 12 },
            padding: 20, boxWidth: 10
          }
        },
        tooltip: commonTooltip
      },
      cutout: '75%',
      animation: { animateScale: true, animateRotate: true, duration: 2000, easing: 'easeOutQuart' }
    };

    this.polarOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, color: textColor, font: { family: 'Inter', size: 12 }, padding: 15 } },
        tooltip: commonTooltip
      },
      scales: {
        r: {
          grid: { color: surfaceBorder },
          angleLines: { color: surfaceBorder },
          ticks: { display: false },
          pointLabels: { color: textColorSecondary, font: { family: 'Inter', size: 11 } }
        }
      },
      animation: { animateScale: true, animateRotate: true, duration: 2000, easing: 'easeOutQuart' }
    };
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
      firstValueFrom(this.userService.getAllUsers()).catch(() => []),
      firstValueFrom(this.produitService.getAllProduits()).catch(() => []),
      firstValueFrom(this.produitService.getAllPacks()).catch(() => []),
      firstValueFrom(this.produitService.getAllGaranties()).catch(() => [])
    ])
      .then(([users, produits, packs, garanties]) => {
        this.stats = {
          totalUsers: users?.length || 0,
          totalProduits: produits?.length || 0,
          totalPacks: packs?.length || 0,
          totalGaranties: garanties?.length || 0
        };
        // Options are already initialized by loadStats or theme subscription
        this.initChartOptions();
        this.prepareCharts(produits, packs, users, garanties);
      })
      .finally(() => { this.loading = false; });
  }

  prepareCharts(produits: any[], packs: any[], users: any[], garanties: any[]): void {
    // Canvas for gradients
    const documentStyle = getComputedStyle(document.documentElement);
    let ctx, gradientBar, gradientBarHover;
    try {
      const canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      if (ctx) {
        gradientBar = ctx.createLinearGradient(0, 0, 0, 400);
        gradientBar.addColorStop(0, '#8B5CF6'); // Violet
        gradientBar.addColorStop(1, '#4F46E5'); // Indigo

        gradientBarHover = ctx.createLinearGradient(0, 0, 0, 400);
        gradientBarHover.addColorStop(0, '#A78BFA');
        gradientBarHover.addColorStop(1, '#6366F1');
      }
    } catch (e) {
      // Fallback if canvas creation fails
    }

    // 1. Bar Chart: Produits par Type
    const typesCount = (produits || []).reduce((acc: any, p: any) => {
      const type = p.typeProduit || 'Autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    this.barChartData = {
      labels: Object.keys(typesCount).length ? Object.keys(typesCount) : ['Assurance Auto', 'Habitation', 'Santé', 'Vie'],
      datasets: [
        {
          label: 'Produits',
          backgroundColor: gradientBar || '#4F46E5',
          hoverBackgroundColor: gradientBarHover || '#6366F1',
          data: Object.keys(typesCount).length ? Object.values(typesCount) : [12, 8, 15, 5],
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    };

    // 2. Pie Chart: Packs par Niveau de Couverture
    const niveauCount = (packs || []).reduce((acc: any, p: any) => {
      const niveau = p.niveauCouverture || 'Non défini';
      acc[niveau] = (acc[niveau] || 0) + 1;
      return acc;
    }, {});

    // Fetch surface color for pie borders to match dark/light mode dynamically
    const surfaceColor = documentStyle.getPropertyValue('--app-surface').trim() || '#ffffff';

    this.pieChartData = {
      labels: Object.keys(niveauCount).length ? Object.keys(niveauCount) : ['Premium', 'Standard', 'Basic', 'Gold'],
      datasets: [
        {
          data: Object.keys(niveauCount).length ? Object.values(niveauCount) : [35, 45, 15, 5],
          backgroundColor: ['#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'],
          hoverBackgroundColor: ['#22D3EE', '#60A5FA', '#A78BFA', '#FBBF24', '#34D399'],
          borderWidth: 4,
          borderColor: surfaceColor,
          hoverBorderColor: surfaceColor,
          hoverOffset: 8
        }
      ]
    };

    // 3. Line Chart: Croissance des Utilisateurs (Mock data for demo if no dates present)
    this.lineChartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
      datasets: [
        {
          label: 'Nouveaux Utilisateurs',
          data: [12, 19, 15, 25, 22, 30, (users?.length || 35)],
          fill: true,
          borderColor: '#10B981',
          tension: 0.4,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10B981',
          pointBorderColor: surfaceColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    // 4. Polar Area Chart: Répartition des Garanties
    const typeGarantieCount = (garanties || []).reduce((acc: any, g: any) => {
      const type = g.typeGarantie || 'Standard';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    this.polarChartData = {
      labels: Object.keys(typeGarantieCount).length ? Object.keys(typeGarantieCount) : ['Responsabilité', 'Dommage', 'Vol', 'Incendie'],
      datasets: [
        {
          data: Object.keys(typeGarantieCount).length ? Object.values(typeGarantieCount) : [11, 16, 7, 3],
          backgroundColor: [
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(139, 92, 246, 0.7)'
          ],
          borderColor: surfaceColor,
          borderWidth: 2
        }
      ]
    };
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2);
  }

  navigateToUsers(): void { this.router.navigate(['/users']); }
  navigateToProduits(): void { this.router.navigate(['/produits']); }
  navigateToPacks(): void { this.router.navigate(['/packs']); }
  navigateToGaranties(): void { this.router.navigate(['/garanties']); }
  navigateToChatbot(): void { this.router.navigate(['/chatbot']); }
}
