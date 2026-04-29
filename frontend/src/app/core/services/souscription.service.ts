import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Backend DTO interfaces
export interface SouscriptionRequest {
  idClient: string;
  idPack: string;
  dateEffet: string;
  documents?: string[];
  conditionsSpeciales?: Record<string, any>;
}

export interface Contrat {
  idContrat?: string;
  idClient: string;
  idPack: string;
  idProduit?: string;
  dateSouscription: string;
  dateEffet: string;
  dateEcheance: string;
  primeMensuelle: number;
  statut: StatutContrat;
  documents?: string[];
  conditionsSpeciales?: Record<string, any>;
  creePar?: string;
  dateCreation?: string;
  dateModification?: string;
  
  // Champs legacy pour compatibilité
  numeroPolice?: string;
  packId?: string;
  clientId?: string;
  dateDebut?: string;
  dateFin?: string;
  statutPaiement?: string;
  primeAnnuelle?: number;
}

export enum StatutContrat {
  EN_ATTENTE = 'EN_ATTENTE',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  RESILIE = 'RESILIE',
  EXPIRE = 'EXPIRE'
}

// Enhanced interfaces from shared version
export interface Souscription {
  idSouscription: string;
  numeroPolice?: string;
  clientId: string;
  packId: string;
  nomClient: string;
  nomPack: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  statutPaiement: string;
  primeMensuelle: number;
  primeAnnuelle: number;
  dateProchainPaiement?: string;
  garantiesPersonnalisees?: any[];
  options?: any;
  dateCreation?: string;
  dateModification?: string;
}

export interface SouscriptionCreate {
  clientId: string;
  packId: string;
  dateDebut: string;
  dateFin?: string;
  garantiesPersonnalisees?: any[];
  options?: any;
  primeMensuelle?: number;
  statutPaiement?: string;
}

export interface SouscriptionUpdate {
  dateFin?: string;
  statut?: string;
  statutPaiement?: string;
  primeMensuelle?: number;
  garantiesPersonnalisees?: any[];
  options?: any;
}

export interface SouscriptionFilter {
  searchTerm?: string;
  clientId?: string;
  packId?: string;
  statut?: string;
  statutPaiement?: string;
  dateDebutMin?: string;
  dateDebutMax?: string;
  dateFinMin?: string;
  dateFinMax?: string;
  primeMin?: number;
  primeMax?: number;
}

export interface SouscriptionStatistics {
  totalSouscriptions: number;
  souscriptionsActives: number;
  souscriptionsEnAttente: number;
  souscriptionsSuspendues: number;
  souscriptionsResiliees: number;
  revenuMensuelTotal: number;
  revenuAnnuelTotal: number;
  primeMoyenne: number;
  dureeMoyenneMois: number;
}

export interface EligibiliteResult {
  eligible: boolean;
  raisons?: string[];
  recommandations?: string[];
  score?: number;
}

// Response interfaces
export interface SouscriptionResponse {
  success: boolean;
  data: Souscription;
  message?: string;
}

export interface SouscriptionListResponse {
  success: boolean;
  data: Souscription[];
  total: number;
  message?: string;
}

export interface SouscriptionPaginatedResponse {
  success: boolean;
  data: Souscription[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  message?: string;
}

export interface SouscriptionStatisticsResponse {
  success: boolean;
  data: SouscriptionStatistics;
  message?: string;
}

export interface EligibiliteResponse {
  success: boolean;
  data: EligibiliteResult;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SouscriptionService {
  private readonly api = `${environment.apiUrl.gateway}/api/souscriptions`; // Utiliser Gateway
  private readonly contratApi = `${environment.apiUrl.gateway}/api/contrats`; // Utiliser Gateway
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private readonly http: HttpClient) {}

  // Basic CRUD operations
  getAll(): Observable<Contrat[]> {
    console.log('SouscriptionService: Getting all souscriptions via Gateway...');
    return this.http.get<Contrat[]>(this.contratApi).pipe(
      map((contrats) => {
        console.log('SouscriptionService: Successfully got souscriptions:', contrats);
        return contrats;
      }),
      catchError((error) => {
        console.error('SouscriptionService: Error getting souscriptions:', error);
        if (error?.status === 404) {
          console.warn('SouscriptionService: No souscriptions found (404), returning empty array');
          return of([]);
        }
        if (error?.status === 403) {
          console.error('SouscriptionService: Access forbidden (403) - check JWT token and permissions');
        }
        if (error?.status === 500) {
          console.error('SouscriptionService: Server error (500) - check backend logs');
        }
        return this.handleError(error);
      })
    );
  }

  getAllContrats(): Observable<Contrat[]> {
    return this.getAll(); // Alias for consistency
  }

  getAllSouscriptions(): Observable<SouscriptionListResponse> {
    return this.http.get<SouscriptionListResponse>(this.api).pipe(
      tap(response => this.logAction('READ', 'Toutes les souscriptions récupérées', response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  getById(id: string): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.api}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getContratById(id: string): Observable<Contrat> {
    return this.getById(id); // Alias for consistency
  }

  getSouscriptionById(id: string): Observable<SouscriptionResponse> {
    return this.http.get<SouscriptionResponse>(`${this.api}/${id}`).pipe(
      tap(response => this.logAction('READ', 'Souscription récupérée avec succès', response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  create(request: SouscriptionRequest): Observable<Contrat> {
    return this.http.post<Contrat>(`${environment.apiUrl.gateway}/souscription/creer`, request, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  creerSouscription(request: SouscriptionRequest): Observable<Contrat> {
    return this.create(request); // Alias for consistency
  }

  createSouscription(createDTO: SouscriptionCreate): Observable<SouscriptionResponse> {
    return this.http.post<SouscriptionResponse>(this.api, createDTO, this.httpOptions).pipe(
      tap(response => this.logAction('CREATE', 'Souscription créée avec succès', response)),
      catchError(error => this.handleError('CREATE', error))
    );
  }

  update(id: string, contrat: Contrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.api}/${id}`, contrat, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateContrat(id: string, contrat: Contrat): Observable<Contrat> {
    return this.update(id, contrat); // Alias for consistency
  }

  updateSouscription(id: string, updateDTO: SouscriptionUpdate): Observable<SouscriptionResponse> {
    return this.http.put<SouscriptionResponse>(`${this.api}/${id}`, updateDTO, this.httpOptions).pipe(
      tap(response => this.logAction('UPDATE', 'Souscription mise à jour avec succès', response)),
      catchError(error => this.handleError('UPDATE', error))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteContrat(id: string): Observable<void> {
    return this.delete(id); // Alias for consistency
  }

  deleteSouscription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this.logAction('DELETE', 'Souscription supprimée avec succès')),
      catchError(error => this.handleError('DELETE', error))
    );
  }

  // Advanced filtering and search
  getByClient(clientId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.api}/client/${clientId}`).pipe(
      catchError(this.handleError)
    );
  }

  getContratsByClient(clientId: string): Observable<Contrat[]> {
    return this.getByClient(clientId); // Alias for consistency
  }

  getSouscriptionsByClientId(clientId: string): Observable<SouscriptionListResponse> {
    return this.http.get<SouscriptionListResponse>(`${this.api}/client/${clientId}`).pipe(
      tap(response => this.logAction('READ', `Souscriptions du client ${clientId} récupérées`, response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  searchSouscriptions(filter: SouscriptionFilter, page: number = 0, size: number = 10): Observable<SouscriptionPaginatedResponse> {
    let params = this.buildFilterParams(filter);
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());

    return this.http.get<SouscriptionPaginatedResponse>(`${this.api}/search`, { params }).pipe(
      tap(response => this.logAction('SEARCH', 'Recherche de souscriptions effectuée', response)),
      catchError(error => this.handleError('SEARCH', error))
    );
  }

  getSouscriptionsByPackId(packId: string): Observable<SouscriptionListResponse> {
    return this.http.get<SouscriptionListResponse>(`${this.api}/pack/${packId}`).pipe(
      tap(response => this.logAction('READ', `Souscriptions du pack ${packId} récupérées`, response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  getSouscriptionsByStatut(statut: string): Observable<SouscriptionListResponse> {
    return this.http.get<SouscriptionListResponse>(`${this.api}/statut/${statut}`).pipe(
      tap(response => this.logAction('READ', `Souscriptions avec statut ${statut} récupérées`, response)),
      catchError(error => this.handleError('READ', error))
    );
  }

  // Status management
  activerSouscription(id: string): Observable<SouscriptionResponse> {
    return this.http.patch<SouscriptionResponse>(`${this.api}/${id}/activer`, {}, this.httpOptions).pipe(
      tap(response => this.logAction('ACTIVATE', 'Souscription activée avec succès', response)),
      catchError(error => this.handleError('ACTIVATE', error))
    );
  }

  suspendreSouscription(id: string, motif: string): Observable<SouscriptionResponse> {
    const params = new HttpParams().set('motif', motif);
    return this.http.patch<SouscriptionResponse>(`${this.api}/${id}/suspendre`, {}, { params }).pipe(
      tap(response => this.logAction('SUSPEND', 'Souscription suspendue avec succès', response)),
      catchError(error => this.handleError('SUSPEND', error))
    );
  }

  resilierSouscription(id: string, motif: string): Observable<SouscriptionResponse> {
    const params = new HttpParams().set('motif', motif);
    return this.http.patch<SouscriptionResponse>(`${this.api}/${id}/resilier`, {}, { params }).pipe(
      tap(response => this.logAction('RESILIER', 'Souscription résiliée avec succès', response)),
      catchError(error => this.handleError('RESILIER', error))
    );
  }

  mettreAJourStatutPaiement(id: string, statutPaiement: string): Observable<SouscriptionResponse> {
    const params = new HttpParams().set('statutPaiement', statutPaiement);
    return this.http.patch<SouscriptionResponse>(`${this.api}/${id}/statut-paiement`, {}, { params }).pipe(
      tap(response => this.logAction('PAYMENT', 'Statut de paiement mis à jour avec succès', response)),
      catchError(error => this.handleError('PAYMENT', error))
    );
  }

  // Business logic operations
  verifierEligibilite(clientId: string, packId: string): Observable<EligibiliteResponse> {
    const params = new HttpParams()
      .set('clientId', clientId)
      .set('packId', packId);

    return this.http.get<EligibiliteResponse>(`${this.api}/eligibilite`, { params }).pipe(
      tap(response => this.logAction('ELIGIBILITY', 'Vérification d\'éligibilité effectuée', response)),
      catchError(error => this.handleError('ELIGIBILITY', error))
    );
  }

  validerSouscription(createDTO: SouscriptionCreate): Observable<any> {
    return this.http.post(`${this.api}/validate`, createDTO, this.httpOptions).pipe(
      tap(response => this.logAction('VALIDATE', 'Souscription validée', response)),
      catchError(error => this.handleError('VALIDATE', error))
    );
  }

  simulerPrimes(packId: string, garantiesPersonnalisees?: any[]): Observable<any> {
    const payload = {
      packId,
      garantiesPersonnalisees: garantiesPersonnalisees || []
    };

    return this.http.post(`${this.api}/simulate-primes`, payload, this.httpOptions).pipe(
      tap(response => this.logAction('SIMULATE', 'Simulation des primes effectuée', response)),
      catchError(error => this.handleError('SIMULATE', error))
    );
  }

  // Statistics and reporting
  getSouscriptionStatistics(): Observable<SouscriptionStatisticsResponse> {
    return this.http.get<SouscriptionStatisticsResponse>(`${this.api}/statistics`).pipe(
      tap(response => this.logAction('STATISTICS', 'Statistiques des souscriptions récupérées', response)),
      catchError(error => this.handleError('STATISTICS', error))
    );
  }

  exportSouscriptions(filter?: Partial<SouscriptionFilter>): Observable<Blob> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.searchTerm) {
        params = params.set('searchTerm', filter.searchTerm);
      }
      if (filter.statut) {
        params = params.set('statut', filter.statut);
      }
      if (filter.statutPaiement) {
        params = params.set('statutPaiement', filter.statutPaiement);
      }
    }

    return this.http.get(`${this.api}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      tap(() => this.logAction('EXPORT', 'Export des souscriptions effectué')),
      catchError(error => this.handleError('EXPORT', error))
    );
  }

  // Utility methods
  private buildFilterParams(filter: SouscriptionFilter): HttpParams {
    let params = new HttpParams();
    
    Object.keys(filter).forEach(key => {
      const value = filter[key as keyof SouscriptionFilter];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    return params;
  }

  private handleError(operation: string, error?: any): Observable<never> {
    console.error(`Erreur ${operation} Souscription:`, error);
    
    let errorMessage = 'Une erreur est survenue lors de l\'opération de souscription';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.status) {
      errorMessage = `Erreur HTTP ${error.status}: ${error.statusText}`;
    }

    return throwError(() => ({
      success: false,
      error: errorMessage,
      details: error.error?.details || error
    }));
  }

  private logAction(operation: string, message: string, data?: any): void {
    console.log(`[${operation}] Souscription Service: ${message}`, data ? data : '');
  }
}
