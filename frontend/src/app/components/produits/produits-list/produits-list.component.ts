import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../../core/services/produit.service';
import { Produit, Garantie } from '../../../models/entities.model';

@Component({
  selector: 'app-produits-list',
  template: `
    <div class="container">
      <h2>Liste des Produits</h2>
      <button class="btn btn-primary mb-3" (click)="nouveauProduit()">Nouveau Produit</button>
      
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Type</th>
              <th>Prix Base</th>
              <th>Garanties</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let produit of produits">
              <td>{{ produit.nomProduit }}</td>
              <td>{{ produit.description }}</td>
              <td>{{ produit.typeProduit }}</td>
              <td>{{ produit.prixBase }} DT</td>
              <td>
                <span class="badge bg-info me-1" *ngFor="let garantie of produit.garanties || []">
                  {{ garantie.nomGarantie }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="modifierProduit(produit.idProduit)">Modifier</button>
                <button class="btn btn-sm btn-danger" (click)="supprimerProduit(produit.idProduit)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .badge { margin: 2px; }
    .btn { margin: 2px; }
  `]
})
export class ProduitsListComponent implements OnInit {
  produits: Produit[] = [];

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.getProduitsAvecGarantiesDetaillees().subscribe(
      data => this.produits = data,
      error => console.error('Erreur:', error)
    );
  }

  nouveauProduit(): void {
    // Navigation vers le formulaire de création
  }

  modifierProduit(id: string): void {
    // Navigation vers le formulaire de modification
  }

  supprimerProduit(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe(
        () => this.loadProduits(),
        error => console.error('Erreur:', error)
      );
    }
  }
}
