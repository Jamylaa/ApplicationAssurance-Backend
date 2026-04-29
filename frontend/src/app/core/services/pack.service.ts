import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pack, Statut, TypeClient } from '../../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PackService {
  private readonly api = environment.apiProduit;
  private readonly packConfigurationApi = environment.apiProduit + '/configuration';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private readonly http: HttpClient) {}

  // Basic CRUD operations
  getAll(): Observable<Pack[]> {
    return this.http.get<Pack[]>(this.api);
  }

  getAllPacks(): Observable<Pack[]> {
    return this.getAll(); // Alias for consistency
  }

  getById(id: string): Observable<Pack> {
    return this.http.get<Pack>(`${this.api}/${id}`);
  }

  getPackById(id: string): Observable<Pack> {
    return this.getById(id); // Alias for consistency
  }

  getByProduit(produitId: string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/produit/${produitId}`);
  }

  getPacksByProduit(produitId: string): Observable<Pack[]> {
    return this.getByProduit(produitId); // Alias for consistency
  }

  create(pack: Pack): Observable<Pack> {
    return this.http.post<Pack>(this.api, pack, this.httpOptions);
  }

  createPack(pack: Pack): Observable<Pack> {
    return this.create(pack); // Alias for consistency
  }

  update(id: string, pack: Pack): Observable<Pack> {
    return this.http.put<Pack>(`${this.api}/${id}`, pack, this.httpOptions);
  }

  updatePack(id: string, pack: Pack): Observable<Pack> {
    return this.update(id, pack); // Alias for consistency
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  deletePack(id: string): Observable<void> {
    return this.delete(id); // Alias for consistency
  }

  // Advanced operations
  desactiverPack(id: string): Observable<Pack> {
    return this.http.patch<Pack>(`${this.api}/${id}/desactiver`, {}, this.httpOptions);
  }

  getPacksByStatut(statut: Statut): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/statut/${statut}`);
  }

  searchPacks(nom: string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/search?nom=${nom}`);
  }

  getPacksByPrixRange(prixMin: number, prixMax: number): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/prix-range?min=${prixMin}&max=${prixMax}`);
  }

  getPacksByTypeClient(typeClient: TypeClient): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/type-client/${typeClient}`);
  }

  // Configuration operations
  calculPrixTotal(packId: string): Observable<number> {
    return this.http.get<number>(`${this.packConfigurationApi}/${packId}/prix-total`);
  }

  getConfigurationsPack(packId: string): Observable<any> {
    return this.http.get<any>(`${this.packConfigurationApi}/${packId}/configurations`);
  }

  updateConfigurationPack(packId: string, configuration: any): Observable<any> {
    return this.http.put<any>(`${this.packConfigurationApi}/${packId}/configuration`, configuration, this.httpOptions);
  }

  // Validation and eligibility
  validateEligibilite(packId: string, clientData: any): Observable<{ eligible: boolean; raisons?: string[] }> {
    return this.http.post<{ eligible: boolean; raisons?: string[] }>(`${this.api}/${packId}/validate-eligibilite`, clientData, this.httpOptions);
  }

  // Statistics and reporting
  getPackStatistics(packId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${packId}/statistics`);
  }

  getPackPopularity(): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/popularity`);
  }

  // Batch operations
  createMultiplePacks(packs: Pack[]): Observable<Pack[]> {
    return this.http.post<Pack[]>(`${this.api}/batch`, packs, this.httpOptions);
  }

  updateMultiplePacks(packs: Pack[]): Observable<Pack[]> {
    return this.http.put<Pack[]>(`${this.api}/batch`, packs, this.httpOptions);
  }

  // Helper methods
  getActivePacks(): Observable<Pack[]> {
    return this.getPacksByStatut(Statut.ACTIF);
  }

  getPacksByNiveauCouverture(niveauCouverture: string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.api}/niveau-couverture/${niveauCouverture}`);
  }

  clonePack(packId: string, nouveauNom: string): Observable<Pack> {
    return this.http.post<Pack>(`${this.api}/${packId}/clone`, { nomPack: nouveauNom }, this.httpOptions);
  }
}
