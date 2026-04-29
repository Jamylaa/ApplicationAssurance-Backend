import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, map, throwError } from 'rxjs';
import { Garantie, Produit, Pack, Statut, TypeGarantie, TypeProduit, NiveauCouverture, TypeMontant, TypePlafond, PackGarantie } from '../../models/entities.model';
import { environment } from '../../../environments/environment';
import { EnumMapperUtil } from '../utils/enum-mapper.util';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly api = environment.apiProduit; // Utiliser service direct
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private readonly http: HttpClient) {}

  // Basic CRUD operations
  getAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.api).pipe(
      map((produits) => {
        return produits;
      }),
      catchError((error) => {
        if (error?.status === 404) {
          return of([]);
        }
        if (error?.status === 403) {
          return throwError(() => new Error('Access forbidden - check JWT token and permissions'));
        }
        if (error?.status === 500) {
          return this.handle500Error();
        }
        return this.handleError(error);
      })
    );
  }

  // Stratégie de fallback pour les erreurs 500
  private handle500Error(): Observable<Produit[]> {
    return of([]);
  }

  getAllProduits(): Observable<Produit[]> {
    return this.getAll(); // Alias for consistency
  }

  getById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.api}/${id}`);
  }

  getProduitById(id: string): Observable<Produit> {
    return this.getById(id); // Alias for consistency
  }

  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }

  create(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.api, produit, this.httpOptions);
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.create(produit); // Alias for consistency
  }

  update(id: string, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.api}/${id}`, produit, this.httpOptions);
  }

  updateProduit(id: string, produit: Produit): Observable<Produit> {
    return this.update(id, produit); // Alias for consistency
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  deleteProduit(id: string): Observable<void> {
    return this.delete(id); // Alias for consistency
  }

  // Advanced filtering operations
  getProduitsByType(typeProduit: TypeProduit): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/type/${typeProduit}`);
  }

  getProduitsByStatut(statut: Statut): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/statut/${statut}`);
  }

  getProduitsActifs(): Observable<Produit[]> {
    return this.getProduitsByStatut(Statut.ACTIF);
  }

  searchProduits(nom: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/search?nom=${nom}`);
  }

  getProduitsByPrixRange(prixMin: number, prixMax: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/prix-range?min=${prixMin}&max=${prixMax}`);
  }

  // Status management
  desactiverProduit(id: string): Observable<Produit> {
    return this.http.patch<Produit>(`${this.api}/${id}/desactiver`, {}, this.httpOptions);
  }

  activerProduit(id: string): Observable<Produit> {
    return this.http.patch<Produit>(`${this.api}/${id}/activer`, {}, this.httpOptions);
  }

  // Pack-related operations
  getProduitsAvecPacks(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/avec-packs`);
  }

  getPacksParProduit(produitId: string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/${produitId}/packs`);
  }

  // Statistics and analytics
  getProduitStatistics(produitId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${produitId}/statistics`);
  }

  getProduitsPopulaires(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.api}/populaires`);
  }

  // Validation and business logic
  validateProduit(produit: Produit): Observable<{ valide: boolean; erreurs?: string[] }> {
    return this.http.post<{ valide: boolean; erreurs?: string[] }>(`${this.api}/validate`, produit, this.httpOptions);
  }

  calculerPrixEstime(produitId: string, parametres: any): Observable<number> {
    return this.http.post<number>(`${this.api}/${produitId}/calculer-prix`, parametres, this.httpOptions);
  }

  // Batch operations
  createMultipleProduits(produits: Produit[]): Observable<Produit[]> {
    return this.http.post<Produit[]>(`${this.api}/batch`, produits, this.httpOptions);
  }

  updateMultipleProduits(produits: Produit[]): Observable<Produit[]> {
    return this.http.put<Produit[]>(`${this.api}/batch`, produits, this.httpOptions);
  }

  // Helper methods
  getProduitsAvecGarantiesDetaillees(): Observable<Produit[]> {
    return this.getAllProduits();
  }

  cloneProduit(produitId: string, nouveauNom: string): Observable<Produit> {
    return this.http.post<Produit>(`${this.api}/${produitId}/clone`, { nomProduit: nouveauNom }, this.httpOptions);
  }

  // Export operations
  exportProduits(format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.api}/export?format=${format}`, { responseType: 'blob' });
  }
}
