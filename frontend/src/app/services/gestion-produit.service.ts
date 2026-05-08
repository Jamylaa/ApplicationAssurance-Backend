import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  
  Garantie as GarantieModel,
  NiveauCouverture,
  Pack as PackModel,
  PackGarantie,
  Produit as ProduitModel,
  Statut,
  TypeClient,
  TypeGarantie,
  TypeProduit
} from '../models/entities.model';

export type Produit = ProduitModel;
export type Pack = PackModel;
export type Garantie = GarantieModel;

@Injectable({
  providedIn: 'root'
})
export class GestionProduitService {
  private readonly apiUrl = `${environment.apiProduit}`;

  constructor(private http: HttpClient) {}


  // Gestion des produits
  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits`);
  }

  getProduitById(idProduit: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${ idProduit }`);
  }

  getProduitsByType(typeProduit: TypeProduit | string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits/type/${typeProduit}`);
  }

  getProduitsByStatut(statut: Statut | string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits/statut/${statut}`);
  }

  searchProduits(nom: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/produits/search?nom=${nom}`);
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/produits`, produit);
  }

  updateProduit(id: string, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/produits/${id}`, produit);
  }

  desactiverProduit(id: string): Observable<Produit> {
    return this.http.patch<Produit>(`${this.apiUrl}/produits/${id}/desactiver`, {});
  }

  deleteProduit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`);
  }

  // Gestion des packs 
  getAllPacks(): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs`);
  }

  getPackById(idPack: string): Observable<Pack> {
    return this.http.get<Pack>(`${this.apiUrl}/packs/${idPack}`);
  }

  getPacksByProduit(produitId: string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs/produit/${produitId}`);
  }

  getPacksByStatut(statut: Statut | string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs/statut/${statut}`);
  }

  getPacksByNiveau(niveauCouverture: NiveauCouverture | string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs/niveau/${niveauCouverture}`);
  }

  getPacksByTypeClient(typeClient: TypeClient | string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs/type-client/${typeClient}`);
  }

  searchPacks(nomPack: string): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs/search?nomPack=${nomPack}`);
  }

  getPacksByPrixRange(prixMin: number, prixMax: number): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs/prix-range?prixMin=${prixMin}&prixMax=${prixMax}`);
  }

  createPack(pack: Pack): Observable<Pack> {
    return this.http.post<Pack>(`${this.apiUrl}/packs`, pack);
  }

  updatePack(idPack: string, pack: Pack): Observable<Pack> {
    return this.http.put<Pack>(`${this.apiUrl}/packs/${idPack}`, pack);
  }

  desactiverPack(idPack: string): Observable<Pack> {
    return this.http.patch<Pack>(`${this.apiUrl}/packs/${idPack}/desactiver`, {});
  }

  deletePack(idPack: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/packs/${idPack}`);
  }

  // Gestion des garanties 
  getAllGaranties(): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties`);
  }

  getGarantieById(idGarantie: string): Observable<Garantie> {
    return this.http.get<Garantie>(`${this.apiUrl}/garanties/${idGarantie}`);
  }

  getGarantiesByType(typeGarantie: TypeGarantie | string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties/type/${typeGarantie}`);
  }

  getGarantiesByStatut(statut: Statut | string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties/statut/${statut}`);
  }

  searchGaranties(nomGarantie: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties/search?nomGarantie=${nomGarantie}`);
  }

  getGarantiesByTauxMin(tauxMin: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties/taux-min/${tauxMin}`);
  }

  getGarantiesByPlafondMin(plafondMin: number): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/garanties/plafond-min/${plafondMin}`);
  }

  createGarantie(garantie: Garantie): Observable<Garantie> {
    return this.http.post<Garantie>(`${this.apiUrl}/garanties`, garantie);
  }

  updateGarantie(idGarantie: string, garantie: Garantie): Observable<Garantie> {
    return this.http.put<Garantie>(`${this.apiUrl}/garanties/${idGarantie}`, garantie);
  }

  desactiverGarantie(idGarantie: string): Observable<Garantie> {
    return this.http.patch<Garantie>(`${this.apiUrl}/garanties/${idGarantie}/desactiver`, {});
  }

  deleteGarantie(idGarantie: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/garanties/${idGarantie}`);
  }

  // Gestion de la configuration des packs (Pack-Garantie)
  
  // READ
  getGarantiesDuPack(packId: string): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(`${this.apiUrl}/pack-configuration/${packId}/garanties`);
  }

  getGarantiesInclusesDuPack(packId: string): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(`${this.apiUrl}/pack-configuration/${packId}/garanties/incluses`);
  }

  getGarantiesOptionnellesDuPack(packId: string): Observable<PackGarantie[]> {
    return this.http.get<PackGarantie[]>(`${this.apiUrl}/pack-configuration/${packId}/garanties/optionnelles`);
  }

  getGarantiesDisponiblesPourPack(packId: string): Observable<Garantie[]> {
    return this.http.get<Garantie[]>(`${this.apiUrl}/pack-configuration/${packId}/garanties-disponibles`);
  }

  calculerPrixTotalPack(packId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pack-configuration/${packId}/prix-total`);
  }

  // CREATE
  ajouterGarantieAuPack(packId: string, garantieId: string, packGarantie: PackGarantie): Observable<PackGarantie> {
    return this.http.post<PackGarantie>(`${this.apiUrl}/pack-configuration/${packId}/garanties/${garantieId}`, packGarantie);
  }

  // creerPackAvecGaranties(request: CreatePackWithGarantiesRequest): Observable<Pack> {
  //   return this.http.post<Pack>(`${this.apiUrl}/pack-configuration/avec-garanties-complet`, request);
  // }

  // UPDATE
  modifierGarantieDansPack(packId: string, packGarantieId: string, details: PackGarantie): Observable<PackGarantie> {
    return this.http.put<PackGarantie>(`${this.apiUrl}/pack-configuration/${packId}/garanties/${packGarantieId}`, details);
  }

  // DELETE
  supprimerGarantieDuPack(packId: string, packGarantieId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pack-configuration/${packId}/garanties/${packGarantieId}`);
  }
}
