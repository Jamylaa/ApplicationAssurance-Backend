import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { ProduitService } from '../../../core/services/produit.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-configuration-form',
  template: `
    <div class="container-fluid">
      <h2>{{ isEditMode ? 'Modifier' : 'Nouvelle' }} Configuration</h2>
      
      <form (ngSubmit)="onSubmit()" #configForm="ngForm">
        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h5>Informations Générales</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label for="nomConfiguration" class="form-label">Nom de la Configuration</label>
                  <input type="text" class="form-control" id="nomConfiguration" 
                         [(ngModel)]="configuration.nomConfiguration" name="nomConfiguration" required>
                </div>
                
                <div class="mb-3">
                  <label for="produitId" class="form-label">Produit</label>
                  <select class="form-control" id="produitId" 
                          [(ngModel)]="configuration.produitId" name="produitId" required>
                    <option value="">Sélectionner...</option>
                    <option *ngFor="let produit of produits" [value]="produit.idProduit">
                      {{ produit.nomProduit }}
                    </option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea class="form-control" id="description" rows="3"
                            [(ngModel)]="configuration.description" name="description"></textarea>
                </div>
                
                <div class="mb-3">
                  <label for="version" class="form-label">Version</label>
                  <input type="text" class="form-control" id="version" 
                         [(ngModel)]="configuration.version" name="version">
                </div>
                
                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="active" 
                           [(ngModel)]="configuration.active" name="active">
                    <label class="form-check-label" for="active">
                      Configuration active
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-8">
            <!-- Onglets pour les différentes sections -->
            <ul class="nav nav-tabs" id="configTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="champs-tab" data-bs-toggle="tab" 
                        data-bs-target="#champs" type="button" role="tab">
                  Champs Formulaire
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="regles-tab" data-bs-toggle="tab" 
                        data-bs-target="#regles" type="button" role="tab">
                  Règles de Calcul
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="workflows-tab" data-bs-toggle="tab" 
                        data-bs-target="#workflows" type="button" role="tab">
                  Workflows
                </button>
              </li>
            </ul>
            
            <div class="tab-content" id="configTabContent">
              <!-- Onglet Champs Formulaire -->
              <div class="tab-pane fade show active" id="champs" role="tabpanel">
                <div class="card mt-3">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5>Champs du Formulaire</h5>
                    <button type="button" class="btn btn-sm btn-primary" (click)="ajouterChamp()">
                      Ajouter un champ
                    </button>
                  </div>
                  <div class="card-body">
                    <div *ngIf="configuration.champsFormulaire.length === 0" class="text-muted">
                      Aucun champ défini. Cliquez sur "Ajouter un champ" pour commencer.
                    </div>
                    
                    <div *ngFor="let champ of configuration.champsFormulaire; let i = index" 
                         class="border rounded p-3 mb-3">
                      <div class="row">
                        <div class="col-md-6">
                          <input type="text" class="form-control mb-2" placeholder="Nom du champ"
                                 [(ngModel)]="champ.nomChamp" [name]="'nomChamp_' + i">
                          <input type="text" class="form-control mb-2" placeholder="Label"
                                 [(ngModel)]="champ.label" [name]="'label_' + i">
                        </div>
                        <div class="col-md-4">
                          <select class="form-control mb-2" [(ngModel)]="champ.typeChamp" 
                                  [name]="'typeChamp_' + i">
                            <option *ngFor="let type of typesChamp" [value]="type">{{ type }}</option>
                          </select>
                          <input type="number" class="form-control" placeholder="Ordre"
                                 [(ngModel)]="champ.ordre" [name]="'ordre_' + i">
                        </div>
                        <div class="col-md-2">
                          <button type="button" class="btn btn-sm btn-danger" 
                                  (click)="supprimerChamp(i)">Supprimer</button>
                        </div>
                      </div>
                      
                      <div class="row mt-2">
                        <div class="col-md-6">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                                   [(ngModel)]="champ.obligatoire" [name]="'obligatoire_' + i">
                            <label class="form-check-label">Obligatoire</label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                                   [(ngModel)]="champ.visible" [name]="'visible_' + i">
                            <label class="form-check-label">Visible</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <input type="text" class="form-control" placeholder="Valeur par défaut"
                                 [(ngModel)]="champ.valeurParDefaut" [name]="'valeurParDefaut_' + i">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Onglet Règles de Calcul -->
              <div class="tab-pane fade" id="regles" role="tabpanel">
                <div class="card mt-3">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5>Règles de Calcul</h5>
                    <button type="button" class="btn btn-sm btn-primary" (click)="ajouterRegle()">
                      Ajouter une règle
                    </button>
                  </div>
                  <div class="card-body">
                    <div *ngIf="configuration.reglesCalcul.length === 0" class="text-muted">
                      Aucune règle définie. Cliquez sur "Ajouter une règle" pour commencer.
                    </div>
                    
                    <div *ngFor="let regle of configuration.reglesCalcul; let i = index" 
                         class="border rounded p-3 mb-3">
                      <div class="row">
                        <div class="col-md-4">
                          <input type="text" class="form-control mb-2" placeholder="Nom de la règle"
                                 [(ngModel)]="regle.nomRegle" [name]="'nomRegle_' + i">
                          <select class="form-control" [(ngModel)]="regle.typeRegle" 
                                  [name]="'typeRegle_' + i">
                            <option *ngFor="let type of typesRegle" [value]="type">{{ type }}</option>
                          </select>
                        </div>
                        <div class="col-md-6">
                          <textarea class="form-control" placeholder="Formule de calcul"
                                    [(ngModel)]="regle.formule" [name]="'formule_' + i" rows="3"></textarea>
                        </div>
                        <div class="col-md-2">
                          <button type="button" class="btn btn-sm btn-danger" 
                                  (click)="supprimerRegle(i)">Supprimer</button>
                          <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" 
                                   [(ngModel)]="regle.active" [name]="'active_' + i">
                            <label class="form-check-label">Active</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Onglet Workflows -->
              <div class="tab-pane fade" id="workflows" role="tabpanel">
                <div class="card mt-3">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5>Workflows</h5>
                    <button type="button" class="btn btn-sm btn-primary" (click)="ajouterWorkflow()">
                      Ajouter un workflow
                    </button>
                  </div>
                  <div class="card-body">
                    <div *ngIf="configuration.workflows.length === 0" class="text-muted">
                      Aucun workflow défini. Cliquez sur "Ajouter un workflow" pour commencer.
                    </div>
                    
                    <div *ngFor="let workflow of configuration.workflows; let i = index" 
                         class="border rounded p-3 mb-3">
                      <div class="row">
                        <div class="col-md-4">
                          <input type="text" class="form-control mb-2" placeholder="Nom du workflow"
                                 [(ngModel)]="workflow.nomWorkflow" [name]="'nomWorkflow_' + i">
                          <select class="form-control" [(ngModel)]="workflow.typeWorkflow" 
                                  [name]="'typeWorkflow_' + i">
                            <option *ngFor="let type of typesWorkflow" [value]="type">{{ type }}</option>
                          </select>
                        </div>
                        <div class="col-md-6">
                          <textarea class="form-control" placeholder="Description"
                                    [(ngModel)]="workflow.description" [name]="'description_' + i" rows="2"></textarea>
                        </div>
                        <div class="col-md-2">
                          <button type="button" class="btn btn-sm btn-danger" 
                                  (click)="supprimerWorkflow(i)">Supprimer</button>
                          <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" 
                                   [(ngModel)]="workflow.actif" [name]="'actif_' + i">
                            <label class="form-check-label">Actif</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-12">
            <button type="submit" class="btn btn-primary" [disabled]="!configForm.valid">
              {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="annuler()">Annuler</button>
            <button type="button" class="btn btn-info" (click)="testerConfiguration()">
              Tester la configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .nav-tabs { margin-bottom: 0; }
    .tab-content { border: 1px solid #dee2e6; border-top: none; }
    .form-check { margin-bottom: 5px; }
  `]
})
export class ConfigurationFormComponent implements OnInit {
  configuration: ConfigurationProduit;
  produits: any[] = [];
  typesChamp = Object.values(TypeChamp);
  typesRegle = Object.values(TypeRegle);
  typesWorkflow = Object.values(TypeWorkflow);
  isEditMode = false;

  constructor(
    private configurationService: ConfigurationService,
    private produitService: ProduitService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.configuration = this.configurationService.creerConfigurationVide('');
  }

  ngOnInit(): void {
    this.loadProduits();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadConfiguration(id);
    } else {
      const produitId = this.route.snapshot.paramMap.get('produitId');
      if (produitId) {
        this.configuration.produitId = produitId;
      }
    }
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe(
      data => this.produits = data,
      error => console.error('Erreur:', error)
    );
  }

  loadConfiguration(id: string): void {
    this.configurationService.getConfigurationById(id).subscribe(
      data => this.configuration = data,
      error => console.error('Erreur:', error)
    );
  }

  ajouterChamp(): void {
    const nouveauChamp = this.configurationService.creerChampFormulaireVide();
    nouveauChamp.idChamp = 'champ_' + Date.now();
    this.configuration.champsFormulaire.push(nouveauChamp);
  }

  supprimerChamp(index: number): void {
    this.configuration.champsFormulaire.splice(index, 1);
  }

  ajouterRegle(): void {
    const nouvelleRegle = this.configurationService.creerRegleCalculVide();
    nouvelleRegle.idRegle = 'regle_' + Date.now();
    this.configuration.reglesCalcul.push(nouvelleRegle);
  }

  supprimerRegle(index: number): void {
    this.configuration.reglesCalcul.splice(index, 1);
  }

  ajouterWorkflow(): void {
    const nouveauWorkflow = this.configurationService.creerWorkflowVide();
    nouveauWorkflow.idWorkflow = 'workflow_' + Date.now();
    this.configuration.workflows.push(nouveauWorkflow);
  }

  supprimerWorkflow(index: number): void {
    this.configuration.workflows.splice(index, 1);
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.configurationService.updateConfiguration(this.configuration.idConfiguration, this.configuration).subscribe(
        () => this.router.navigate(['/configurations']),
        error => console.error('Erreur:', error)
      );
    } else {
      this.configurationService.createConfiguration(this.configuration).subscribe(
        () => this.router.navigate(['/configurations']),
        error => console.error('Erreur:', error)
      );
    }
  }

  annuler(): void {
    this.router.navigate(['/configurations']);
  }

  testerConfiguration(): void {
    // Logique de test de configuration
    console.log('Test de la configuration:', this.configuration);
  }
}
