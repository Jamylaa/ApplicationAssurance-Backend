import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// PrimeNG Components
import { BreadcrumbPrimeComponent } from '../breadcrumb/breadcrumb-prime.component';
import { PaginationPrimeComponent } from '../pagination/pagination-prime.component';
import { FilterPrimeComponent } from '../filter/filter-prime.component';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-example-prime',
  template: `
    <div class="example-page">
      <!-- Breadcrumb -->
      <app-breadcrumb-prime 
        [items]="breadcrumbItems"
        [showHome]="true">
      </app-breadcrumb-prime>

      <!-- Page Header -->
      <div class="page-header mb-4">
        <h1>Exemple d'Utilisation PrimeNG</h1>
        <p class="text-muted">Démonstration des composants réutilisables avec PrimeNG</p>
      </div>

      <!-- Filter Section -->
      <p-card header="Filtres" class="mb-4">
        <app-filter-prime 
          [config]="filterConfig"
          [initialValues]="initialFilters"
          (filterChange)="onFilterChange($event)"
          (search)="onSearch($event)"
          title="Filtres avancés">
        </app-filter-prime>
      </p-card>

      <!-- Data Table -->
      <p-card header="Liste des Données" class="mb-4">
        <p-table 
          [value]="filteredData" 
          [paginator]="true"
          [rows]="paginationConfig.pageSize"
          [totalRecords]="totalItems"
          [first]="(paginationConfig.currentPage - 1) * paginationConfig.pageSize"
          [lazy]="true"
          (onLazyLoad)="loadData($event)"
          [loading]="loading"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="paginationConfig.pageSizeOptions"
          [globalFilterFields]="['nom', 'email', 'statut']"
          [globalFilter]="globalFilter"
          responsiveLayout="scroll">
          
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="field">ID</th>
              <th pSortableColumn="nom">Nom</th>
              <th pSortableColumn="email">Email</th>
              <th pSortableColumn="statut">Statut</th>
              <th pSortableColumn="dateCreation">Date de création</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-data>
            <tr>
              <td>{{ data.id }}</td>
              <td>{{ data.nom }}</td>
              <td>{{ data.email }}</td>
              <td>
                <span [ngClass]="getStatusClass(data.statut)">
                  {{ data.statut }}
                </span>
              </td>
              <td>{{ formatDate(data.dateCreation) }}</td>
              <td>
                <div class="action-buttons">
                  <p-button 
                    icon="pi pi-eye" 
                    class="p-button-rounded p-button-outlined p-button-sm me-2"
                    (click)="viewDetails(data)"
                    tooltip="Voir les détails">
                  </p-button>
                  <p-button 
                    icon="pi pi-pencil" 
                    class="p-button-rounded p-button-outlined p-button-sm me-2"
                    (click)="editItem(data)"
                    tooltip="Modifier">
                  </p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    class="p-button-rounded p-button-outlined p-button-sm p-button-danger"
                    (click)="deleteItem(data)"
                    tooltip="Supprimer">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Pagination -->
      <app-pagination-prime 
        [config]="paginationConfig"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)">
      </app-pagination-prime>

      <!-- Toast Messages -->
      <p-toast [position]="'top-right'"></p-toast>
    </div>
  `,
  styles: [`
    .example-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 1rem;
    }

    .page-header h1 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .status-active {
      background-color: #d4edda;
      color: #155724;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-inactive {
      background-color: #f8d7da;
      color: #721c24;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .example-page {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: stretch;
      }

      .action-buttons .p-button {
        margin-bottom: 0.25rem;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbPrimeComponent,
    PaginationPrimeComponent,
    FilterPrimeComponent,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ExamplePrimePage implements OnInit {
  breadcrumbItems = [
    { label: 'Accueil', link: '/admin/dashboard' },
    { label: 'Exemples', link: '/admin/examples' },
    { label: 'PrimeNG' }
  ];

  filterConfig = {
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', placeholder: 'Rechercher par nom...' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'Rechercher par email...' },
      { 
        key: 'statut', 
        label: 'Statut', 
        type: 'select', 
        options: [
          { value: 'ACTIF', label: 'Actif' },
          { value: 'INACTIF', label: 'Inactif' },
          { value: 'EN_ATTENTE', label: 'En attente' }
        ]
      },
      { key: 'dateCreation', label: 'Date de création', type: 'daterange' },
      { key: 'age', label: 'Âge', type: 'slider', min: 18, max: 100 }
    ],
    showReset: true,
    showSearch: true,
    layout: 'grid',
    collapsible: true
  };

  paginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50],
    showPageSizeSelector: true,
    showFirstLastButtons: true,
    showJumpToPage: true
  };

  initialFilters = {};
  globalFilter = '';
  filteredData: any[] = [];
  allData: any[] = [];
  loading = false;
  totalItems = 0;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.generateMockData();
    this.applyFilters();
  }

  private generateMockData(): void {
    this.allData = Array.from({ length: 150 }, (_, index) => ({
      id: index + 1,
      nom: `Utilisateur ${index + 1}`,
      email: `user${index + 1}@example.com`,
      statut: ['ACTIF', 'INACTIF', 'EN_ATTENTE'][index % 3],
      dateCreation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      age: 18 + Math.floor(Math.random() * 82)
    }));
    
    this.totalItems = this.allData.length;
  }

  onFilterChange(filters: any): void {
    this.applyFilters();
  }

  onSearch(searchTerm: string): void {
    this.globalFilter = searchTerm;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.loadFilteredData();
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationConfig.pageSize = pageSize;
    this.paginationConfig.currentPage = 1;
    this.applyFilters();
  }

  loadData(event: any): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      const startIndex = event.first;
      const endIndex = startIndex + event.rows;
      this.filteredData = this.allData.slice(startIndex, endIndex);
      this.totalItems = this.allData.length;
      this.loading = false;
    }, 500);
  }

  private applyFilters(): void {
    this.loading = true;
    
    // Simulate filtering
    setTimeout(() => {
      this.loadFilteredData();
      this.loading = false;
    }, 300);
  }

  private loadFilteredData(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
    const endIndex = startIndex + this.paginationConfig.pageSize;
    
    let filtered = [...this.allData];
    
    // Apply global search filter
    if (this.globalFilter) {
      const searchTerm = this.globalFilter.toLowerCase();
      filtered = filtered.filter(item => 
        item.nom.toLowerCase().includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm) ||
        item.statut.toLowerCase().includes(searchTerm)
      );
    }
    
    this.filteredData = filtered.slice(startIndex, endIndex);
    this.totalItems = filtered.length;
  }

  viewDetails(item: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Détails',
      detail: `Affichage des détails pour ${item.nom}`,
      life: 3000
    });
  }

  editItem(item: any): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Modification',
      detail: `Modification de ${item.nom}`,
      life: 3000
    });
  }

  deleteItem(item: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Suppression',
      detail: `Suppression de ${item.nom}`,
      life: 3000
    });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'ACTIF':
        return 'status-active';
      case 'INACTIF':
        return 'status-inactive';
      case 'EN_ATTENTE':
        return 'status-pending';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }
}
