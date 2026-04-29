import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { ConfigurationProduit } from '../../../models/gestion-produit.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-configurations-list',
  template: `
    <div class="container">
      <h2>Liste des Configurations</h2>
      
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Rechercher..." 
                   [(ngModel)]="searchTerm" (keyup)="filterConfigurations()">
            <button class="btn btn-outline-secondary" type="button">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6 text-end">
          <button class="btn btn-success" (click)="exporterConfigurations()">
            <i class="bi bi-download"></i> Exporter
          </button>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Produit ID</th>
              <th>Description</th>
              <th>Version</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let config of configurationsFiltrees">
              <td>{{ config.nomConfiguration }}</td>
              <td>{{ config.produitId }}</td>
              <td>{{ config.description }}</td>
              <td><span class="badge bg-info">{{ config.version }}</span></td>
              <td>
                <span class="badge" [class]="config.active ? 'bg-success' : 'bg-secondary'">
                  {{ config.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-primary" (click)="voirConfiguration(config.idConfiguration)">
                  Voir
                </button>
                <button class="btn btn-sm btn-warning" (click)="modifierConfiguration(config.idConfiguration)">
                  Modifier
                </button>
                <button class="btn btn-sm btn-info" (click)="dupliquerConfiguration(config)">
                  Dupliquer
                </button>
                <button class="btn btn-sm btn-danger" (click)="supprimerConfiguration(config.idConfiguration)">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="configurationsFiltrees.length === 0" class="text-center text-muted">
        Aucune configuration trouvée
      </div>
    </div>
  `,
  styles: [`
    .badge { margin: 2px; }
    .btn { margin: 2px; }
  `]
})
export class ConfigurationsListComponent implements OnInit {
  configurations: ConfigurationProduit[] = [];
  configurationsFiltrees: ConfigurationProduit[] = [];
  searchTerm = '';

  constructor(private configurationService: ConfigurationService) {}

  ngOnInit(): void {
    this.loadConfigurations();
  }

  loadConfigurations(): void {
    this.configurationService.getAllConfigurations().subscribe(
      data => {
        this.configurations = data;
        this.configurationsFiltrees = data;
      },
      error => console.error('Erreur:', error)
    );
  }

  filterConfigurations(): void {
    const term = this.searchTerm.toLowerCase();
    this.configurationsFiltrees = this.configurations.filter(config =>
      config.nomConfiguration.toLowerCase().includes(term) ||
      config.description.toLowerCase().includes(term) ||
      config.produitId.toLowerCase().includes(term)
    );
  }

  voirConfiguration(id: string): void {
    // Navigation vers la page de détail
  }

  modifierConfiguration(id: string): void {
    // Navigation vers le formulaire de modification
  }

  dupliquerConfiguration(config: ConfigurationProduit): void {
    const nouveauNom = prompt('Entrez le nom pour la configuration dupliquée:', 
                              config.nomConfiguration + ' - Copie');
    if (nouveauNom) {
      this.configurationService.dupliquerConfiguration(config.idConfiguration, nouveauNom).subscribe(
        () => this.loadConfigurations(),
        error => console.error('Erreur:', error)
      );
    }
  }

  supprimerConfiguration(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      this.configurationService.deleteConfiguration(id).subscribe(
        () => this.loadConfigurations(),
        error => console.error('Erreur:', error)
      );
    }
  }

  exporterConfigurations(): void {
    const dataStr = JSON.stringify(this.configurations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configurations.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
