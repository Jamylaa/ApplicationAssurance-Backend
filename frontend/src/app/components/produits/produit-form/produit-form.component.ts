import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../../core/services/produit.service';
import { GarantieService } from '../../../core/services/garantie.service';
import { ProduitForm, Produit, Garantie, TypeProduit, Statut } from '../../../models/entities.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-produit-form', 
  template: `
    <div class="container">
      <h2>{{ isEditMode ? 'Modifier' : 'Nouveau' }} Produit</h2>
      
      <form (ngSubmit)="onSubmit()" #produitForm="ngForm">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="nomProduit" class="form-label">Nom du Produit</label>
              <input type="text" class="form-control" id="nomProduit" 
                     [(ngModel)]="produit.nomProduit" name="nomProduit" required>
            </div>
            
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea class="form-control" id="description" rows="3"
                        [(ngModel)]="produit.description" name="description"></textarea>
            </div>
            
            <div class="mb-3">
              <label for="typeProduit" class="form-label">Type de Produit</label>
              <select class="form-control" id="typeProduit" 
                      [(ngModel)]="produit.typeProduit" name="typeProduit" required>
                <option value="">Sélectionner...</option>
                <option *ngFor="let type of typesProduit" [value]="type">{{ type }}</option>
              </select>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="prixBase" class="form-label">Prix Base (DT)</label>
                  <input type="number" class="form-control" id="prixBase" 
                         [(ngModel)]="produit.prixBase" name="prixBase" min="0" step="0.01">
                </div>
              </div>
              <div class="col-md-3">
                <div class="mb-3">
                  <label for="ageMin" class="form-label">Âge Min</label>
                  <input type="number" class="form-control" id="ageMin" 
                         [(ngModel)]="produit.ageMin" name="ageMin" min="0">
                </div>
              </div>
              <div class="col-md-3">
                <div class="mb-3">
                  <label for="ageMax" class="form-label">Âge Max</label>
                  <input type="number" class="form-control" id="ageMax" 
                         [(ngModel)]="produit.ageMax" name="ageMax" min="0">
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label for="garanties" class="form-label">Garanties</label>
              <div class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                <div class="form-check" *ngFor="let garantie of garantiesDisponibles">
                  <input class="form-check-input" type="checkbox" 
                         [id]="'garantie_' + garantie.idGarantie"
                         [value]="garantie.idGarantie"
                         (change)="toggleGarantie(garantie)"
                         [checked]="isGarantieSelected(garantie)">
                  <label class="form-check-label" [for]="'garantie_' + garantie.idGarantie">
                    <strong>{{ garantie.nomGarantie }}</strong>
                    <br>
                    <small>{{ garantie.description }}</small>
                    <br>
                    <span class="text-muted">Plafond: {{ garantie.plafondAnnuel }} DT | 
                          Couverture: {{ garantie.tauxRemboursement | percent:'1.0-0' }}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="maladieChronique" 
                       [(ngModel)]="produit.maladieChroniqueAutorisee" name="maladieChronique">
                <label class="form-check-label" for="maladieChronique">
                  Autoriser les maladies chroniques
                </label>
              </div>
              
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diabetique" 
                       [(ngModel)]="produit.diabetiqueAutorise" name="diabetique">
                <label class="form-check-label" for="diabetique">
                  Autoriser les diabétiques
                </label>
              </div>
              
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="actif" 
                       [(ngModel)]="produit.actif" name="actif">
                <label class="form-check-label" for="actif">
                  Produit actif
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mb-3">
          <button type="submit" class="btn btn-primary" [disabled]="!produitForm.valid">
            {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="annuler()">Annuler</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-check { margin-bottom: 10px; }
    .form-check-label { margin-left: 5px; }
  `]
})
export class ProduitFormComponent implements OnInit {
  produit: ProduitForm = {
    nomProduit: '',
    description: '',
    typeProduit: TypeProduit.SANTE,
    categorie: '',
    ageMin: undefined,
    ageMax: undefined,
    maladieChroniqueAutorisee: false,
    diabetiqueAutorisee: false,
    diabetiqueAutorise: false,
    actif: true,
    prixBase: undefined,
    garanties: []
  };

  garantiesDisponibles: Garantie[] = [];
  typesProduit = Object.values(TypeProduit);
  isEditMode = false;

  constructor(
    private produitService: ProduitService,
    private garantieService: GarantieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGaranties();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadProduit(id);
    }
  }

  loadGaranties(): void {
    this.garantieService.getGarantiesActives().subscribe(
      data => this.garantiesDisponibles = data,
      error => console.error('Erreur:', error)
    );
  }

  loadProduit(id: string): void {
    this.produitService.getProduitById(id).subscribe(
      data => {
        this.produit = {
          ...data
          // garanties field removed from backend
        };
      },
      error => console.error('Erreur:', error)
    );
  }

  toggleGarantie(garantie: Garantie): void {
    // garanties field removed from backend - this method should be updated
    // to handle PackGarantie associations instead
    console.log('Garantie toggle not implemented - garanties field removed from backend');
  }

  isGarantieSelected(garantie: Garantie): boolean {
    // garanties field removed from backend - this method should be updated
    // to handle PackGarantie associations instead
    return false;
  }

  onSubmit(): void {
    // Convertir ProduitForm en Produit pour le service
    const produitData: Produit = {
      idProduit: this.isEditMode ? this.getCurrentProduitId() : '',
      nomProduit: this.produit.nomProduit,
      description: this.produit.description,
      typeProduit: this.produit.typeProduit as TypeProduit,
      statut: this.produit.actif ? Statut.ACTIF : Statut.INACTIF,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    if (this.isEditMode) {
      this.produitService.updateProduit(produitData.idProduit, produitData).subscribe(
        () => this.router.navigate(['/produits']),
        error => console.error('Erreur:', error)
      );
    } else {
      this.produitService.createProduit(produitData).subscribe(
        () => this.router.navigate(['/produits']),
        error => console.error('Erreur:', error)
      );
    }
  }

  private getCurrentProduitId(): string {
    // Récupérer l'ID depuis les paramètres de route ou depuis une propriété
    return this.route.snapshot.paramMap.get('id') || '';
  }

  annuler(): void {
    this.router.navigate(['/produits']);
  }
}
