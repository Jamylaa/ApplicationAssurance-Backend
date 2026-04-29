import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { 
  Produit, 
  Pack,
  ProduitForm, 
  ProduitFilter, 
  ProduitStatistics,
  ApiResponse,
  PaginatedResponse } from '../../models/entities.model';
import { TypeProduit } from '../../models/entities.model';
/**
 * Service refactorisé pour la gestion des produits
 * Architecture propre avec gestion d'erreurs et logging
 */
@Injectable({
  providedIn: 'root'
})
export class ProduitRefactoredService {

  private readonly apiUrl = `${environment.apiUrl}/api/v1/produits`;

  constructor(private http: HttpClient) { }

  /**
   * Crée un nouveau produit
   */
  createProduit(produitForm: ProduitForm): Observable<ApiResponse<Produit>> {
    return this.http.post<ApiResponse<Produit>>(this.apiUrl, produitForm).pipe(
      tap(response => this.logAction('CREATE', 'Produit créé avec succès', response)),
      catchError(error => this.handleError('CREATE', error))
    );
  }

  /**
   * Met à jour un produit existant
   */
  updateProduit(id: string, produitForm: ProduitForm): Observable<ApiResponse<Produit>> {
    return this.http.put<ApiResponse<Produit>>(`${this.apiUrl}/${id}`, produitForm).pipe(
      tap(response => this.logAction('UPDATE', 'Produit mis à jour avec succès', response)),
      catchError(error => this.handleError('UPDATE', error))
    );
  }

  /**
   * Supprime un produit
   */
  deleteProduit(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      tap(response => this.logAction('DELETE', 'Produit supprimé avec succès', response)),
      catchError(error => this.handleError('DELETE', error))
    );
  }

  /**
   * Récupère un produit par son ID
   */
  getProduitById(id: string): Observable<ApiResponse<Produit>> {
    return this.http.get<ApiResponse<Produit>>(`${this.apiUrl}/${id}`).pipe(
      tap(response => this.logAction('READ', 'Produit récupéré avec succès', response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  /**
   * Récupère tous les produits
   */
  getAllProduits(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(this.apiUrl).pipe(
      tap(response => this.logAction('READ', 'Tous les produits récupérés', response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  /**
   * Récupère les produits par type
   */
  getProduitsByType(type: TypeProduit): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/type/${type}`).pipe(
      tap(response => this.logAction('READ', `Produits de type ${type} récupérés`, response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  /**
   * Récupère les produits actifs
   */
  getProduitsActifs(): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/actifs`).pipe(
      tap(response => this.logAction('READ', 'Produits actifs récupérés', response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  /**
   * Recherche de produits avec pagination
   */
  searchProduits(filter: ProduitFilter, page: number = 0, size: number = 10): Observable<ApiResponse<PaginatedResponse<Produit>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }
    if (filter.typeProduit) {
      params = params.set('type', filter.typeProduit);
    }
    if (filter.actif !== undefined) {
      params = params.set('actif', filter.actif.toString());
    }
    if (filter.categorie) {
      params = params.set('categorie', filter.categorie);
    }
    if (filter.prixMin !== undefined) {
      params = params.set('prixMin', filter.prixMin.toString());
    }
    if (filter.prixMax !== undefined) {
      params = params.set('prixMax', filter.prixMax.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<Produit>>>(`${this.apiUrl}/search`, { params }).pipe(
      tap(response => this.logAction('SEARCH', 'Recherche de produits effectuée', response)),
      catchError(error => this.handleError('SEARCH', error))
    );
  }

  /**
   * Active/désactive un produit
   */
  toggleProduitActif(id: string): Observable<ApiResponse<Produit>> {
    return this.http.patch<ApiResponse<Produit>>(`${this.apiUrl}/${id}/toggle-actif`, {}).pipe(
      tap(response => this.logAction('TOGGLE', 'Statut du produit basculé', response)),
      catchError(error => this.handleError('TOGGLE', error))
    );
  }

  /**
   * Récupère les statistiques d'un produit
   */
  getProduitStatistics(id: string): Observable<ApiResponse<ProduitStatistics>> {
    return this.http.get<ApiResponse<ProduitStatistics>>(`${this.apiUrl}/${id}/statistics`).pipe(
      tap(response => this.logAction('STATISTICS', 'Statistiques du produit récupérées', response)),
      catchError(error => this.handleError('STATISTICS', error))
    );
  }

  /**
   * Recherche de produits éligibles selon l'âge
   */
  getProduitsEligiblesParAge(age: number): Observable<ApiResponse<Produit[]>> {
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/eligibles/age/${age}`).pipe(
      tap(response => this.logAction('ELIGIBILITY', `Produits éligibles pour l'âge ${age} récupérés`, response)),
      catchError(error => this.handleError('ELIGIBILITY', error))
    );
  }

  /**
   * Recherche de produits éligibles selon les conditions médicales
   */
  getProduitsEligiblesMedical(accepteMaladieChronique: boolean, estDiabetique: boolean): Observable<ApiResponse<Produit[]>> {
    const params = new HttpParams()
      .set('accepteMaladieChronique', accepteMaladieChronique.toString())
      .set('estDiabetique', estDiabetique.toString());

    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/eligibles/medical`, { params }).pipe(
      tap(response => this.logAction('ELIGIBILITY', 'Produits éligibles médicaux récupérés', response)),
      catchError(error => this.handleError('ELIGIBILITY', error))
    );
  }

  /**
   * Recherche de produits par prix
   */
  getProduitsParPrix(prixMin: number, prixMax: number): Observable<ApiResponse<Produit[]>> {
    const params = new HttpParams()
      .set('prixMin', prixMin.toString())
      .set('prixMax', prixMax.toString());

    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/search/prix`, { params }).pipe(
      tap(response => this.logAction('SEARCH', `Produits entre ${prixMin} et ${prixMax} DT récupérés`, response)),
      catchError(error => this.handleError('SEARCH', error))
    );
  }

  /**
   * Récupère des produits similaires
   */
  getProduitsSimilaires(id: string, limit: number = 5): Observable<ApiResponse<Produit[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<ApiResponse<Produit[]>>(`${this.apiUrl}/${id}/similaires`, { params }).pipe(
      tap(response => this.logAction('SIMILAR', `Produits similaires à ${id} récupérés`, response)),
      catchError(error => this.handleError('SIMILAR', error))
    );
  }

  /**
   * Valide un produit avant création/mise à jour
   */
  validerProduit(produitForm: ProduitForm): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/validate`, produitForm).pipe(
      tap(response => this.logAction('VALIDATE', 'Produit validé', response)),
      catchError(error => this.handleError('VALIDATE', error))
    );
  }

  /**
   * Exporte la liste des produits
   */
  exporterProduits(filter?: ProduitFilter): Observable<Blob> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.typeProduit) {
        params = params.set('type', filter.typeProduit);
      }
      if (filter.actif !== undefined) {
        params = params.set('actif', filter.actif.toString());
      }
    }

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      tap(() => this.logAction('EXPORT', 'Export des produits effectué')),
      catchError(error => this.handleError('EXPORT', error))
    );
  }

  /**
   * Importe des produits depuis un fichier
   */
  importerProduits(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/import`, formData).pipe(
      tap(response => this.logAction('IMPORT', 'Import des produits effectué', response)),
      catchError(error => this.handleError('IMPORT', error))
    );
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(operation: string, error: any): Observable<never> {
    console.error(`Erreur ${operation} Produit:`, error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `Erreur HTTP ${error.status}: ${error.statusText}`;
    }

    return throwError(() => ({
      success: false,
      error: errorMessage,
      details: error.error?.details || error
    }));
  }

  /**
   * Logging des actions
   */
  private logAction(operation: string, message: string, data?: any): void {
    console.log(`[${operation}] Produit Service: ${message}`, data ? data : '');
  }

  /**
   * Méthodes utilitaires
   */
  buildFilterParams(filter: ProduitFilter): HttpParams {
    let params = new HttpParams();
    
    Object.keys(filter).forEach(key => {
      const value = filter[key as keyof ProduitFilter];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    return params;
  }

  /**
   * Vérifie si un produit est éligible selon les critères
   */
  isProduitEligible(produit: Produit, age: number, aMaladieChronique: boolean, estDiabetique: boolean): boolean {
    // Vérification de l'âge
    if (produit.ageMin !== undefined && age < produit.ageMin) {
      return false;
    }
    if (produit.ageMax !== undefined && age > produit.ageMax) {
      return false;
    }

    // Vérification des conditions médicales
    if (aMaladieChronique && produit.maladieChroniqueAutorisee === false) {
      return false;
    }

    if (estDiabetique && produit.diabetiqueAutorise === false) {
      return false;
    }

    return true;
  }

  /**
   * Calcule le prix moyen d'un produit
   */
  calculerPrixMoyen(produit: Produit): number {
    if (!produit.packs || produit.packs.length === 0) {
      return produit.prixBase || 0;
    }

    const prixTotal = produit.packs
      .filter((pack: Pack) => pack.actif)
      .reduce((sum: number, pack: Pack) => sum + pack.prixMensuel, 0);

    return prixTotal / produit.packs.filter((pack: Pack) => pack.actif).length;
  }

  /**
   * Détermine le niveau de popularité d'un produit
   */
  determinerNiveauPopularite(produit: Produit): number {
    let score = 1;

    // Score basé sur le nombre de packs
    if (produit.packs) {
      score += Math.min(produit.packs.length, 3);
    }

    // Score basé sur le prix
    const prixMoyen = this.calculerPrixMoyen(produit);
    if (prixMoyen < 50) score += 2;
    else if (prixMoyen < 100) score += 1;

    // Score basé sur les conditions
    if (produit.maladieChroniqueAutorisee === true) score += 1;
    if (produit.diabetiqueAutorise === true) score += 1;

    return Math.min(score, 5);
  }

  /**
   * Génère des suggestions de produits
   */
  genererSuggestionsProduits(produits: Produit[], limit: number = 5): Produit[] {
    return produits
      .filter(produit => produit.actif)
      .sort((a, b) => {
        // Priorité aux produits les plus populaires
        const scoreA = this.determinerNiveauPopularite(a);
        const scoreB = this.determinerNiveauPopularite(b);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Formate les données pour l'affichage
   */
  formatProduitForDisplay(produit: Produit): any {
    return {
      ...produit,
      prixMoyen: this.calculerPrixMoyen(produit),
      niveauPopularite: this.determinerNiveauPopularite(produit),
      estEligible: (age: number, aMaladieChronique: boolean, estDiabetique: boolean) => 
        this.isProduitEligible(produit, age, aMaladieChronique, estDiabetique)
    };
  }
}
