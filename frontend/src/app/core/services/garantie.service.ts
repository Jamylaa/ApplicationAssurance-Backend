import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Garantie, Statut, TypeGarantie } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class GarantieService {
  private readonly api = environment.apiProduit;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private readonly http: HttpClient) {}

  // Basic CRUD operations
  getAll(): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(this.api);
  }

  getAllGaranties(): Observable<Garantie[]> {
    return this.getAll(); // Alias for consistency
  }

  getById(id: string): Observable<Garantie> {
    return this.http.get<Garantie>(`${this.api}/${id}`);
  }

  getGarantieById(idGarantie: string): Observable<Garantie> {
    return this.getById(idGarantie); // Alias for consistency
  }

  create(garantie: Garantie): Observable<Garantie> {
    return this.http.post<Garantie>(this.api, garantie, this.httpOptions);
  }

  createGarantie(garantie: Garantie): Observable<Garantie> {
    return this.create(garantie); // Alias for consistency
  }

  update(id: string, garantie: Garantie): Observable<Garantie> {
    return this.http.put<Garantie>(`${this.api}/${id}`, garantie, this.httpOptions);
  }

  updateGarantie(idGarantie: string, garantie: Garantie): Observable<Garantie> {
    return this.update(idGarantie, garantie); // Alias for consistency
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  deleteGarantie(idGarantie: string): Observable<any> {
    return this.http.delete(`${this.api}/${idGarantie}`);
  }

  // Advanced filtering operations
  getGarantiesByType(typeGarantie: TypeGarantie): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/type/${typeGarantie}`);
  }

  getGarantiesByStatut(statut: Statut): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/statut/${statut}`);
  }

  getGarantiesActives(): Observable<Garantie[]> {
    return this.getGarantiesByStatut(Statut.ACTIF);
  }

  getGarantiesByTauxMin(taux: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/taux-min/${taux}`);
  }

  getGarantiesByPlafondMin(plafond: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/plafond-min/${plafond}`);
  }

  searchGaranties(nom: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/search?nom=${nom}`);
  }

  // Financial operations
  getGarantiesByTauxRange(tauxMin: number, tauxMax: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/taux-range?min=${tauxMin}&max=${tauxMax}`);
  }

  getGarantiesByPlafondRange(plafondMin: number, plafondMax: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/plafond-range?min=${plafondMin}&max=${plafondMax}`);
  }

  // Pack-related operations
  getGarantiesByPack(packId: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/pack/${packId}`);
  }

  getGarantiesDisponiblesPourPack(packId: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/disponibles-pour-pack/${packId}`);
  }

  // Validation and business logic
  validateGarantie(garantie: Garantie): Observable<{ valide: boolean; erreurs?: string[] }> {
    return this.http.post<{ valide: boolean; erreurs?: string[] }>(`${this.api}/validate`, garantie, this.httpOptions);
  }

  calculerCoutEstime(garantieId: string, parametres: any): Observable<number> {
    return this.http.post<number>(`${this.api}/${garantieId}/calculer-cout`, parametres, this.httpOptions);
  }

  // Statistics and reporting
  getGarantieStatistics(garantieId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${garantieId}/statistics`);
  }

  getGarantiesPopulaires(): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/populaires`);
  }

  // Batch operations
  createMultipleGaranties(garanties: Garantie[]): Observable<Garantie[]> {
    return this.http.post<Garantie[]>(`${this.api}/batch`, garanties, this.httpOptions);
  }

  updateMultipleGaranties(garanties: Garantie[]): Observable<Garantie[]> {
    return this.http.put<Garantie[]>(`${this.api}/batch`, garanties, this.httpOptions);
  }

  // Helper methods
  getGarantiesByTypeMontant(typeMontant: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/type-montant/${typeMontant}`);
  }

  getGarantiesByTypePlafond(typePlafond: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.api}/type-plafond/${typePlafond}`);
  }

  cloneGarantie(garantieId: string, nouveauNom: string): Observable<Garantie> {
    return this.http.post<Garantie>(`${this.api}/${garantieId}/clone`, { nomGarantie: nouveauNom }, this.httpOptions);
  }

  // Status management
  activerGarantie(garantieId: string): Observable<Garantie> {
    return this.http.patch<Garantie>(`${this.api}/${garantieId}/activer`, {}, this.httpOptions);
  }

  desactiverGarantie(garantieId: string): Observable<Garantie> {
    return this.http.patch<Garantie>(`${this.api}/${garantieId}/desactiver`, {}, this.httpOptions);
  }

  // Export operations
  exportGaranties(format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.api}/export?format=${format}`, { responseType: 'blob' });
  }
}
